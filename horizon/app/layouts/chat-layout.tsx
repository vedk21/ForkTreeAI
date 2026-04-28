import { useEffect, useRef, useState } from 'react';

import { ChatArea, type ChatMessage } from '@/components/chat/chat-area';
import { ChatHistoryList } from '@/components/chat/chat-history-list';
import { CreateBranch } from '@/components/chat/create-branch';
import { CreateConversation } from '@/components/chat/create-conversation';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup
} from '@/components/ui/resizable';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
	type ChatTreeItem,
	getChatContext,
	type Message,
	type TreeViewNode
} from '@/lib/chat/helper';

export const ChatLayout = () => {
	// 1. Manage state here
	const [selectedId, setSelectedId] = useState<string>('');
	const [treeData, setTreeData] = useState<ChatTreeItem[]>([]);
	const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
	const [parentMessages, setParentMessages] = useState<ChatMessage[]>([]);
	const messagesCache = useRef<Record<string, ChatMessage[]>>({});

	const [isLoadingTree, setIsLoadingTree] = useState<boolean>(true);
	const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
	const [isCreatingItem, setIsCreatingItem] = useState<boolean>(false);
	const [sendingChatId, setSendingChatId] = useState<string | null>(null);

	const [branchModalData, setBranchModalData] = useState<{
		isOpen: boolean;
		chat: ChatTreeItem;
		parentId: string | null;
		isLast: boolean;
		model: string;
	} | null>(null);

	// Helper to map backend TreeViewNode to frontend ChatTreeItem
	const mapNode = (node: TreeViewNode): ChatTreeItem => ({
		id: node.branch_id,
		name: node.name_of_branch,
		time: node.created_at
			? new Date(node.created_at).toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric'
				})
			: undefined,
		conversation_id: node.conversation_id,
		children: node.children ? node.children.map(mapNode) : []
	});

	// 1.5 Fetch Tree View Data
	useEffect(() => {
		const fetchTree = async () => {
			setIsLoadingTree(true);
			try {
				// Replace the base URL with your actual API endpoint structure if needed
				const res = await fetch(
					'http://localhost:3001/conversations/tree-view'
				);
				const data = await res.json();

				const formattedData = data.map(mapNode);
				setTreeData(formattedData);

				// Auto-select the first branch if nothing is selected
				if (formattedData.length > 0 && !selectedId) {
					setSelectedId(formattedData[0].id);
				}
			} catch (error) {
				console.error('Failed to fetch tree view:', error);
			} finally {
				setIsLoadingTree(false);
			}
		};
		fetchTree();
	}, []);

	// 2. Derive context (current chat and its parent)
	const context = getChatContext(treeData, selectedId);
	const currentChat = context?.current;
	const parentChat = context?.parent;

	// ADDED: Determine if the currently selected chat is a leaf node
	// A leaf node has no children array, or an empty children array
	const isCurrentLeaf =
		!currentChat?.children || currentChat.children.length === 0;

	// 4. Fetch the messages dynamically based on the derived IDs
	useEffect(() => {
		const fetchMessages = async (
			convId: string,
			branchId: string
		): Promise<ChatMessage[]> => {
			// Return from cache if we already loaded it before
			if (messagesCache.current[branchId]) {
				return messagesCache.current[branchId];
			}
			try {
				const res = await fetch(
					`http://localhost:3001/conversations/${convId}/branch-messages/${branchId}`
				);
				const data = (await res.json()) as Message[];
				// Remap "id" to "_id" since your ChatArea UI expects `_id` based on the interface
				const formattedMsgs: ChatMessage[] = data.map((msg) => ({
					content: msg.content,
					created_at: msg.created_at,
					role: msg.role,
					_id: msg.id || msg._id || ''
				}));
				messagesCache.current[branchId] = formattedMsgs;
				return formattedMsgs;
			} catch (error) {
				console.error('Failed to fetch messages:', error);
				return [];
			}
		};

		const loadMessages = async () => {
			const isCurrentCached = currentChat?.id
				? !!messagesCache.current[currentChat.id]
				: true;
			const isParentCached = parentChat?.id
				? !!messagesCache.current[parentChat.id]
				: true;

			if (!isCurrentCached || !isParentCached) {
				setIsLoadingMessages(true);
			}

			if (currentChat?.conversation_id && currentChat.id) {
				const msgs = await fetchMessages(
					currentChat.conversation_id,
					currentChat.id
				);
				setCurrentMessages(msgs);
			} else {
				setCurrentMessages([]);
			}

			if (parentChat?.conversation_id && parentChat.id) {
				const msgs = await fetchMessages(
					parentChat.conversation_id,
					parentChat.id
				);
				setParentMessages(msgs);
			} else {
				setParentMessages([]);
			}

			setIsLoadingMessages(false);
		};

		loadMessages();
	}, [currentChat, parentChat]);

	const handleSendMessage = async (
		chat: ChatTreeItem | undefined,
		content: string,
		isParentPanel: boolean,
		model: string
	) => {
		if (!chat || !chat.conversation_id || !chat.id) return;

		const targetMessages = isParentPanel ? parentMessages : currentMessages;
		const setTargetMessages = isParentPanel
			? setParentMessages
			: setCurrentMessages;

		const lastMessage = targetMessages[targetMessages.length - 1];
		const parentId = lastMessage ? lastMessage._id : null;

		// Optimistically add the user message for instant feedback
		const optimisticUserMsg: ChatMessage = {
			_id: 'temp-' + Date.now(),
			role: 'user',
			content,
			created_at: new Date().toISOString()
		};

		setTargetMessages((prev) => [...prev, optimisticUserMsg]);
		setSendingChatId(chat.id);

		try {
			const res = await fetch(
				`http://localhost:3001/conversations/${chat.conversation_id}/messages`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						content,
						parent_id: parentId,
						current_branch_id: chat.id,
						force_new_branch: false,
						metadata: { model }
					})
				}
			);

			if (!res.ok) throw new Error('Failed to send message');

			const resData = await res.json();
			const newMessages = resData.messages as Message[];
			const formattedNewMsgs: ChatMessage[] = newMessages.map(
				(msg: Message) => ({
					content: msg.content,
					created_at: msg.created_at,
					role: msg.role,
					_id: msg.id || msg._id || ''
				})
			);

			// Replace the optimistic user message and append the actual AI response
			setTargetMessages((prev) => {
				const filtered = prev.filter((m) => m._id !== optimisticUserMsg._id);
				const updated = [...filtered, ...formattedNewMsgs];
				messagesCache.current[chat.id] = updated;
				return updated;
			});

			// Merge the updated branch subtree back into our main tree state
			if (resData.tree) {
				const updatedSubTree = mapNode(resData.tree);
				setTreeData((prev) => {
					const updateTree = (nodes: ChatTreeItem[]): ChatTreeItem[] => {
						return nodes.map((node) => {
							if (node.id === updatedSubTree.id) {
								return updatedSubTree;
							}
							if (node.children && node.children.length > 0) {
								return { ...node, children: updateTree(node.children) };
							}
							return node;
						});
					};
					return updateTree(prev);
				});
			}
		} catch (error) {
			console.error('Failed to send message:', error);
			// Revert optimistic user message on error
			setTargetMessages((prev) =>
				prev.filter((m) => m._id !== optimisticUserMsg._id)
			);
		} finally {
			setSendingChatId(null);
		}
	};

	return (
		<>
			<SidebarProvider>
				<ChatHistoryList
					selectedId={selectedId}
					onSelect={setSelectedId}
					data={treeData}
					isLoading={isLoadingTree}
					isCreating={isCreatingItem}
					onCreateClick={() => setIsCreateModalOpen(true)}
				/>

				<SidebarInset className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden h-screen transition-colors duration-300">
					{/* 3. Conditional Layout Logic */}
					{parentChat && parentMessages.length > 0 ? (
						// HAS PARENT: Render Split View
						<ResizablePanelGroup
							orientation="horizontal"
							className="w-full h-full"
						>
							{/* Parent Chat (Left) */}
							<ResizablePanel defaultSize="50%" minSize="30%">
								<ChatArea
									title={parentChat.name}
									isParent={true}
									isFirstWindow={true}
									isLeaf={false}
									messages={parentMessages}
									isLoading={isLoadingMessages}
									isSending={sendingChatId === parentChat.id}
									onSendMessage={(content, model) =>
										handleSendMessage(parentChat, content, true, model)
									}
									onForkMessage={(parentId, isLast, model) => {
										if (parentChat) {
											setBranchModalData({
												isOpen: true,
												chat: parentChat,
												parentId,
												isLast,
												model
											});
										}
									}}
								/>
							</ResizablePanel>

							{/* Visible Drag Handle */}
							<ResizableHandle
								withHandle
								className="w-1 bg-border/40 hover:bg-primary/50 transition-colors"
							/>

							{/* Current Child Chat (Right) */}
							<ResizablePanel defaultSize="50%" minSize="30%">
								<ChatArea
									title={currentChat?.name}
									isFirstWindow={false}
									isLeaf={isCurrentLeaf}
									messages={currentMessages} // dynamically passed
									isLoading={isLoadingMessages}
									isSending={sendingChatId === currentChat?.id}
									onSendMessage={(content, model) =>
										handleSendMessage(currentChat, content, false, model)
									}
									onForkMessage={(parentId, isLast, model) => {
										if (currentChat) {
											setBranchModalData({
												isOpen: true,
												chat: currentChat,
												parentId,
												isLast,
												model
											});
										}
									}}
								/>
							</ResizablePanel>
						</ResizablePanelGroup>
					) : (
						// NO PARENT: Render Single View
						<ChatArea
							title={currentChat?.name || 'Select a conversation'}
							isLeaf={isCurrentLeaf}
							messages={currentMessages} // dynamically passed
							isLoading={isLoadingMessages}
							isSending={sendingChatId === currentChat?.id}
							onSendMessage={(content, model) =>
								handleSendMessage(currentChat, content, false, model)
							}
							onForkMessage={(parentId, isLast, model) => {
								if (currentChat) {
									setBranchModalData({
										isOpen: true,
										chat: currentChat,
										parentId,
										isLast,
										model
									});
								}
							}}
						/>
					)}
				</SidebarInset>
			</SidebarProvider>

			<CreateConversation
				open={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onCreated={(newItem, newMessages) => {
					// Pre-populate the cache with the received messages so we don't fetch them again
					const formattedMsgs: ChatMessage[] = newMessages.map(
						(msg: ChatMessage) => ({
							content: msg.content,
							created_at: msg.created_at,
							role: msg.role,
							_id: msg._id || ''
						})
					);
					messagesCache.current[newItem.id] = formattedMsgs;

					setTreeData((prev) => [...prev, newItem]);
					setSelectedId(newItem.id);
				}}
				onCreatingChange={setIsCreatingItem}
			/>

			<CreateBranch
				open={branchModalData?.isOpen || false}
				onClose={() => setBranchModalData(null)}
				onCreated={(rawTreeData) => {
					const updatedSubTree = mapNode(rawTreeData as TreeViewNode);
					setTreeData((prev) => {
						const updateTree = (nodes: ChatTreeItem[]): ChatTreeItem[] => {
							return nodes.map((node) => {
								if (node.id === updatedSubTree.id) {
									return updatedSubTree;
								}
								if (node.children && node.children.length > 0) {
									return { ...node, children: updateTree(node.children) };
								}
								return node;
							});
						};
						return updateTree(prev);
					});
				}}
				conversationId={branchModalData?.chat.conversation_id || ''}
				currentBranchId={branchModalData?.chat.id || ''}
				parentId={branchModalData?.parentId || null}
				isLast={branchModalData?.isLast || false}
				model={branchModalData?.model || 'gemini-2.5-flash'}
			/>
		</>
	);
};
