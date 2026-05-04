import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import type { TreeViewNode } from '@/lib/chat/helper';

interface CreateBranchProps {
	open: boolean;
	onClose: () => void;
	onCreated: (
		rawTreeData: TreeViewNode,
		messages: Record<string, unknown>[],
		newBranchName: string,
		ogTrailName?: string
	) => void;
	conversationId: string;
	currentBranchId: string;
	parentId: string | null;
	isLast: boolean;
	model: string;
}

export const CreateBranch = ({
	open,
	onClose,
	onCreated,
	conversationId,
	currentBranchId,
	parentId,
	isLast,
	model
}: CreateBranchProps) => {
	const [isCreating, setIsCreating] = useState(false);
	const [formData, setFormData] = useState({
		newBranchName: '',
		ogTrailName: '',
		question: ''
	});
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Reset form when modal closes
	useEffect(() => {
		if (!open) {
			setFormData({ newBranchName: '', ogTrailName: '', question: '' });
			setIsCreating(false);
		}
	}, [open]);

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
			if (
				formData.newBranchName.trim() &&
				formData.question.trim() &&
				(isLast || formData.ogTrailName.trim())
			) {
				handleCreate(e as unknown as React.FormEvent);
			}
		}
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCreating(true);
		try {
			const body: Record<
				string,
				string | boolean | Record<string, string> | null
			> = {
				content: formData.question,
				parent_id: parentId,
				current_branch_id: currentBranchId,
				force_new_branch: true,
				new_branch_name: formData.newBranchName,
				metadata: { model }
			};

			if (!isLast) {
				body.og_trail_branch_name = formData.ogTrailName;
			}

			const res = await fetch(
				`http://localhost:3001/conversations/${conversationId}/messages`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);

			if (!res.ok) throw new Error('Failed to create branch');

			const resData = await res.json();
			onCreated(
				resData.tree,
				resData.messages,
				formData.newBranchName,
				formData.ogTrailName
			);
			onClose();
		} catch (error) {
			console.error('Error creating branch:', error);
		} finally {
			setIsCreating(false);
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
						Create Branch
					</h2>
					<p className="text-sm text-muted-foreground">
						Fork this conversation into a new branch.
					</p>
				</div>

				<form onSubmit={handleCreate} className="flex flex-col gap-4">
					{!isLast && (
						<div className="flex flex-col gap-2">
							<label htmlFor="ogTrailName" className="text-sm font-semibold">
								Original Trail Branch Name*
							</label>
							<Input
								id="ogTrailName"
								required
								disabled={isCreating}
								value={formData.ogTrailName}
								onChange={(e) =>
									setFormData({ ...formData, ogTrailName: e.target.value })
								}
								placeholder="Name for the existing path"
								className="h-10"
							/>
						</div>
					)}
					<div className="flex flex-col gap-2">
						<label htmlFor="newBranchName" className="text-sm font-semibold">
							New Branch Name*
						</label>
						<Input
							id="newBranchName"
							required
							disabled={isCreating}
							value={formData.newBranchName}
							onChange={(e) =>
								setFormData({ ...formData, newBranchName: e.target.value })
							}
							placeholder="Name for the new path"
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
							placeholder="Ask your alternative question here..."
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
							{isCreating ? 'Creating...' : 'Create Branch'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
