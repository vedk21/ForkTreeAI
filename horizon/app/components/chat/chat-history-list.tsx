import { GitBranch, MessageSquare, Plus, Search, Webhook } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader
} from '@/components/ui/sidebar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { type TreeDataItem, TreeView } from '@/components/ui/tree-view';
import { cn } from '@/lib/utils';

interface ChatTreeItem extends TreeDataItem {
	time?: string;
	children?: ChatTreeItem[];
}

// FIX 1: Replaced hardcoded "..." with full-length strings.
// CSS `truncate` will now handle the ellipsis naturally based on container width.
const chatData: ChatTreeItem[] = [
	{
		id: 'api-auth',
		name: 'API authentication implementation details',
		time: '2h',
		children: [
			{
				id: 'branch-jwt',
				name: 'Branch: JWT implementation guide',
				time: '1h'
			},
			{
				id: 'branch-oauth',
				name: 'Branch: OAuth 2.0 flow setup',
				time: '10m',
				children: [
					{
						id: 'branch-oauth-v2',
						name: 'Branch: OAuth 2.0 implementation guide',
						time: '1m'
					}
				]
			}
		]
	},
	{
		id: 'market-research',
		name: 'Market research: Q4 2026 Analysis',
		time: '1d'
	},
	{
		id: 'blog-post',
		name: 'Blog post: 5 productivity tips',
		time: '3d',
		children: [
			{
				id: 'branch-casual',
				name: 'Branch: Casual tone version',
				time: '2d'
			},
			{
				id: 'branch-pro',
				name: 'Branch: Professional tone version',
				time: '1d'
			}
		]
	}
];

export const ChatHistoryList = () => {
	return (
		// FIX 2: Wrap the component in TooltipProvider. delayDuration sets how fast it appears.
		<TooltipProvider delayDuration={400}>
			<Sidebar className="border-r border-border bg-sidebar">
				<SidebarHeader className="p-0 gap-0 bg-sidebar">
					{/* SEAMLESS LOGO HEADER */}
					<div className="flex items-center gap-3 px-4 h-[73px] border-b border-border shrink-0">
						<div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
							<Webhook className="h-5 w-5" />
						</div>
						<span className="font-semibold text-lg tracking-tight text-sidebar-foreground truncate">
							ForkTreeAI
						</span>
					</div>

					{/* ACTIONS & SEARCH AREA */}
					<div className="p-4 pb-2">
						{/* Title & New Chat Action */}
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-sm font-bold text-sidebar-foreground/50 uppercase tracking-widest">
								Conversations(3)
							</h2>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 bg-primary/75 text-primary-foreground/75 hover:bg-primary hover:text-primary-foreground rounded-xl transition-colors"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{/* Search */}
						<div className="relative mb-0">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search conversations..."
								className="pl-9 h-10 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary w-full transition-all"
							/>
						</div>
					</div>
				</SidebarHeader>

				{/* Tree List Area */}
				<SidebarContent className="px-2 bg-sidebar hide-scrollbar pb-2">
					<div className="w-full grow overflow-hidden">
						<TreeView
							data={chatData}
							initialSelectedItemId="market-research"
							expandAll={false}
							className="w-full"
							renderItem={({
								item,
								level,
								isSelected,
								hasChildren,
								onToggle,
								onSelect
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
										{/* THE BEAUTIFUL ACTIVE INDICATOR (Vertical Bar) */}
										{isSelected && (
											<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--color-primary),0.4)]" />
										)}

										<div className="flex items-center gap-1.5 overflow-hidden text-left flex-1 pl-1">
											{/* SEPARATED CLICK: The Icon area triggers the Accordion Expand/Collapse */}
											<div
												onClick={(e) => {
													e.stopPropagation();
													if (hasChildren && onToggle) onToggle();
												}}
												className={cn(
													'flex items-center justify-center h-6 w-6 shrink-0 rounded-md transition-colors',
													hasChildren && 'cursor-pointer hover:bg-background/80'
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

											{/* FIX 3: Wrapped the text span in a Shadcn Tooltip */}
											<Tooltip>
												<TooltipTrigger asChild>
													<span
														onClick={(e) => {
															e.stopPropagation();
															if (onSelect) onSelect();
														}}
														className={cn(
															'truncate text-[0.9rem] font-medium leading-none cursor-pointer w-full py-1 transition-colors',
															isSelected
																? 'text-primary-foreground'
																: 'text-foreground group-hover:text-foreground'
														)}
													>
														{chatItem.name}
													</span>
												</TooltipTrigger>

												{/* The tooltip pops up with the full un-truncated string */}
												<TooltipContent
													side="right"
													sideOffset={10}
													className="font-medium bg-popover text-popover-foreground border-border shadow-md"
												>
													{chatItem.name}
												</TooltipContent>
											</Tooltip>
										</div>

										{/* TIGHTENED LAYOUT: Badges & Time Container */}
										<div className="flex items-center gap-1.5 shrink-0 ml-1.5">
											{/* Branch Count Pill */}
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

											{/* Time Stamp */}
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
					</div>
				</SidebarContent>
			</Sidebar>
		</TooltipProvider>
	);
};
