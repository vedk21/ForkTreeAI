import {
	GitBranch,
	MessageSquare,
	Plus,
	Search,
	Webhook,
	X
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { TreeView } from '@/components/ui/tree-view';
import { type ChatTreeItem } from '@/lib/chat/helper';
import { cn } from '@/lib/utils';

import { ThemeToggle } from '../common/theme-toggle';

interface ChatHistoryListProps {
	selectedId: string;
	onSelect: (id: string) => void;
	data: ChatTreeItem[];
	isLoading?: boolean;
	isCreating?: boolean;
	onCreateClick: () => void;
}

export const ChatHistoryList = ({
	selectedId,
	onSelect,
	data,
	isLoading,
	isCreating,
	onCreateClick
}: ChatHistoryListProps) => {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredData = useMemo(() => {
		if (!searchQuery.trim()) return data;

		const query = searchQuery.toLowerCase();

		const filterNodes = (nodes: ChatTreeItem[]): ChatTreeItem[] => {
			return nodes.reduce<ChatTreeItem[]>((acc, node) => {
				const matches = node.name.toLowerCase().includes(query);
				const filteredChildren = node.children
					? filterNodes(node.children)
					: [];

				if (matches || filteredChildren.length > 0) {
					acc.push({
						...node,
						children:
							matches && filteredChildren.length === 0
								? node.children
								: filteredChildren
					});
				}
				return acc;
			}, []);
		};

		return filterNodes(data);
	}, [data, searchQuery]);

	return (
		<TooltipProvider delayDuration={400}>
			<Sidebar className="border-r border-border bg-sidebar">
				<SidebarHeader className="p-0 gap-0 bg-sidebar">
					<div className="flex items-center justify-between gap-3 px-4 h-18.25 border-b border-border shrink-0">
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
								<Webhook className="h-5 w-5" />
							</div>
							<span className="font-semibold text-lg tracking-tight text-sidebar-foreground truncate">
								ForkTreeAI
							</span>
						</div>
						<ThemeToggle />
					</div>

					<div className="px-3 pt-4">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-sm font-bold text-sidebar-foreground/50 uppercase tracking-widest">
								Conversations({data.length})
							</h2>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 bg-primary/75 text-primary-foreground/75 hover:bg-primary hover:text-primary-foreground rounded-xl transition-colors"
								onClick={onCreateClick}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="relative mb-2">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search conversations..."
								className="pl-9 pr-9 h-10 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary w-full transition-all"
							/>
							{searchQuery && (
								<Button
									variant="ghost"
									size="icon"
									className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
									onClick={() => setSearchQuery('')}
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent className="px-2 bg-sidebar hide-scrollbar pb-2">
					<div className="w-full grow">
						{isLoading ? (
							<div
								key="tree-skeleton"
								className="flex flex-col gap-2 px-2 pt-4 animate-in fade-in duration-300"
							>
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="flex items-center gap-3 mb-1">
										<Skeleton className="h-6 w-6 rounded-md shrink-0" />
										<Skeleton
											className={`h-5 rounded-md ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`}
										/>
									</div>
								))}
							</div>
						) : data.length > 0 && selectedId ? (
							<div
								key="tree-loaded"
								className="animate-in fade-in slide-in-from-left-2 duration-700 ease-out h-full"
							>
								{filteredData.length > 0 ? (
									<TreeView
										data={filteredData}
										initialSelectedItemId={selectedId}
										expandAll={searchQuery.trim().length > 0}
										className="w-full"
										// FIX 1: Listen to the tree's internal selection change and pass it to layout
										onSelectChange={(item) => {
											if (item) onSelect(item.id);
										}}
										renderItem={({
											item,
											level,
											isSelected,
											hasChildren,
											onToggle,
											onSelect: treeOnSelect // FIX 2: Rename this so it doesn't clash with outer onSelect
										}) => {
											const chatItem = item as ChatTreeItem;
											const branchCount = chatItem.children?.length || 0;

											return (
												<div
													className={cn(
														'group relative flex items-center justify-between w-full py-1.5 pr-2 pl-1 my-0.5 rounded-lg transition-all select-none',
														isSelected ? 'bg-primary/25' : 'hover:bg-muted/50'
													)}
												>
													{isSelected && (
														<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--color-primary),0.4)]" />
													)}

													<div className="flex items-center gap-1.5 overflow-hidden text-left flex-1 pl-1">
														<div
															onClick={(e) => {
																e.stopPropagation();
																if (hasChildren && onToggle) onToggle();
															}}
															className={cn(
																'flex items-center justify-center h-6 w-6 shrink-0 rounded-md transition-colors',
																hasChildren &&
																	'cursor-pointer hover:bg-background/80'
															)}
														>
															{level === 0 ? (
																<MessageSquare
																	className={cn(
																		'h-4 w-4',
																		isSelected
																			? 'text-primary'
																			: 'text-primary-foreground'
																	)}
																/>
															) : (
																<GitBranch
																	className={cn(
																		'h-4 w-4',
																		isSelected
																			? 'text-primary'
																			: 'text-primary-foreground'
																	)}
																/>
															)}
														</div>

														<Tooltip>
															<TooltipTrigger asChild>
																<span
																	onClick={(e) => {
																		e.stopPropagation();
																		// FIX 3: Call the internal tree function to trigger visual state update
																		if (treeOnSelect) treeOnSelect();
																	}}
																	className={cn(
																		'truncate text-[1rem] font-medium leading-none cursor-pointer w-full py-1 transition-colors',
																		isSelected
																			? 'text-primary-foreground'
																			: 'text-foreground group-hover:text-foreground'
																	)}
																>
																	{chatItem.name}
																</span>
															</TooltipTrigger>
															<TooltipContent
																side="right"
																sideOffset={10}
																className="font-medium bg-popover text-popover-foreground border-border shadow-md"
															>
																{chatItem.name}
															</TooltipContent>
														</Tooltip>
													</div>

													<div className="flex items-center gap-1.5 shrink-0 ml-1.5">
														{branchCount > 0 && (
															<span
																className={cn(
																	'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-sm font-bold',
																	isSelected
																		? 'bg-primary text-primary-foreground shadow-sm'
																		: 'bg-primary/25 text-primary-foreground/40'
																)}
															>
																{branchCount}
															</span>
														)}
														{chatItem.time && (
															<span
																className={cn(
																	'text-sm font-medium',
																	isSelected
																		? 'text-primary'
																		: 'text-muted-foreground/60'
																)}
															>
																{chatItem.time}
															</span>
														)}
													</div>
												</div>
											);
										}}
									/>
								) : (
									<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
										<span className="text-sm md:text-base font-medium">
											No conversations found.
										</span>
									</div>
								)}
							</div>
						) : null}

						{isCreating && (
							<div className="flex items-center gap-2 py-2 px-3 mt-1 mx-1 rounded-lg bg-muted/40 animate-pulse border border-border/50">
								<MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
								<div className="flex flex-col gap-1.5 w-full">
									<Skeleton className="h-3 w-2/3" />
								</div>
							</div>
						)}
					</div>
				</SidebarContent>
			</Sidebar>
		</TooltipProvider>
	);
};
