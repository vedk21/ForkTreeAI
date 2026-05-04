import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '@/components/chat/chat-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { type ChatTreeItem } from '@/lib/chat/helper';

interface CreateConversationProps {
	open: boolean;
	onClose: () => void;
	onCreated: (item: ChatTreeItem, messages: ChatMessage[]) => void;
	onCreatingChange: (isCreating: boolean) => void;
}

export const CreateConversation = ({
	open,
	onClose,
	onCreated,
	onCreatingChange
}: CreateConversationProps) => {
	const [isCreating, setIsCreating] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		question: ''
	});
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			setFormData({ name: '', question: '' });
			setIsCreating(false);
		}
	}, [open]);

	// Close on Escape key
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		if (open) {
			document.addEventListener('keydown', handleEsc);
		}
		return () => document.removeEventListener('keydown', handleEsc);
	}, [open, onClose]);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
		}
	}, [formData.question]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (formData.name.trim() && formData.question.trim()) {
				handleCreate(e as unknown as React.FormEvent);
			}
		}
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCreating(true);
		onCreatingChange(true);
		try {
			const res = await fetch('http://localhost:3001/conversations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.name,
					content: formData.question
				})
			});

			if (!res.ok) throw new Error('Failed to create conversation');

			const resData = await res.json();
			const treeData = resData.tree;

			const newNode: ChatTreeItem = {
				id: treeData.id || treeData.branch_id,
				name: treeData.name_of_branch,
				time: treeData.created_at
					? new Date(treeData.created_at).toLocaleDateString(undefined, {
							month: 'short',
							day: 'numeric'
						})
					: undefined,
				conversation_id: treeData.conversation_id,
				children: []
			};

			onCreated(
				newNode,
				resData.messages.map((msg: ChatMessage) => ({
					content: msg.content,
					created_at: msg.created_at,
					role: msg.role,
					_id: msg.id || msg._id || ''
				}))
			);
			onClose();
		} catch (error) {
			console.error('Error creating conversation:', error);
		} finally {
			setIsCreating(false);
			onCreatingChange(false);
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
					onClick={onClose}
					disabled={isCreating}
				>
					<X className="h-5 w-5" />
				</Button>

				<div className="mb-6 space-y-1 pr-8">
					<h2 className="text-lg font-semibold tracking-tight text-foreground">
						New Conversation
					</h2>
					<p className="text-sm text-muted-foreground">
						Start a new branch of thought.
					</p>
				</div>

				<form onSubmit={handleCreate} className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label
							htmlFor="name"
							className="text-sm font-semibold flex items-center justify-between"
						>
							<span>Name*</span>
							<span className="text-xs font-normal text-muted-foreground">
								(Max 20 chars)
							</span>
						</label>
						<Input
							id="name"
							required
							autoFocus
							disabled={isCreating}
							value={formData.name}
							maxLength={20}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="Displayed as the root branch in the sidebar"
							className="h-10"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="question" className="text-sm font-semibold">
							Question*
						</label>
						<textarea
							ref={textareaRef}
							id="question"
							required
							disabled={isCreating}
							value={formData.question}
							onChange={(e) =>
								setFormData({ ...formData, question: e.target.value })
							}
							onKeyDown={handleKeyDown}
							placeholder="Ask your question here..."
							rows={1}
							className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 resize-none overflow-y-auto scrollbar-thin min-h-20 max-h-35"
						/>
						<span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground/75 select-none mt-1">
							<Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> to add a new line
						</span>
					</div>
					<div className="pt-2 flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isCreating} className="min-w-35">
							{isCreating ? 'Creating...' : 'Create Conversation'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
