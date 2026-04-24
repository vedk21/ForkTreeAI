import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type ChatTreeItem } from '@/lib/chat/helper';

interface CreateConversationProps {
	open: boolean;
	onClose: () => void;
	onCreated: (item: ChatTreeItem) => void;
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

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			setFormData({ name: '', question: '' });
			setIsCreating(false);
		}
	}, [open]);

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

			const responseData = await res.json();

			const newNode: ChatTreeItem = {
				id: responseData.branch_id,
				name: responseData.name_of_branch,
				time: responseData.created_at
					? new Date(responseData.created_at).toLocaleDateString(undefined, {
							month: 'short',
							day: 'numeric'
						})
					: undefined,
				conversation_id: responseData.conversation_id,
				children: []
			};

			onCreated(newNode);
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
						<label htmlFor="name" className="text-sm font-semibold">
							Name*
						</label>
						<Input
							id="name"
							required
							disabled={isCreating}
							value={formData.name}
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
						<Input
							id="question"
							required
							disabled={isCreating}
							value={formData.question}
							onChange={(e) =>
								setFormData({ ...formData, question: e.target.value })
							}
							placeholder="Ask your question here..."
							className="h-10"
						/>
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
