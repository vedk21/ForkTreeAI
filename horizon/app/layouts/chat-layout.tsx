import { useState } from 'react';

import { ChatArea } from '@/components/chat/chat-area';
import { ChatHistoryList } from '@/components/chat/chat-history-list';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup
} from '@/components/ui/resizable';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { chatData } from '@/data/raw_chats';
import { getChatContext } from '@/lib/chat/helper';

export const ChatLayout = () => {
	// 1. Manage state here
	const [selectedId, setSelectedId] = useState<string>('branch-jwt');

	// 2. Derive context (current chat and its parent)
	const context = getChatContext(chatData, selectedId);
	const currentChat = context?.current;
	const parentChat = context?.parent;

	// ADDED: Determine if the currently selected chat is a leaf node
	// A leaf node has no children array, or an empty children array
	const isCurrentLeaf =
		!currentChat?.children || currentChat.children.length === 0;

	return (
		<SidebarProvider>
			<ChatHistoryList selectedId={selectedId} onSelect={setSelectedId} />

			<SidebarInset className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden h-screen transition-colors duration-300">
				{/* 3. Conditional Layout Logic */}
				{parentChat ? (
					// HAS PARENT: Render Split View
					<ResizablePanelGroup
						orientation="horizontal"
						className="w-full h-full"
					>
						{/* Parent Chat (Left) */}
						<ResizablePanel defaultSize="50%" minSize="30%">
							<ChatArea
								title={parentChat.name}
								isParent={true} // Triggers view-only mode
								isFirstWindow={true}
								isLeaf={false} // A parent is never a leaf
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
								isLeaf={isCurrentLeaf} // Pass the calculated boolean here
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				) : (
					// NO PARENT: Render Single View
					<ChatArea
						title={currentChat?.name || 'Select a conversation'}
						isLeaf={isCurrentLeaf} // Pass the calculated boolean here
					/>
				)}
			</SidebarInset>
		</SidebarProvider>
	);
};
