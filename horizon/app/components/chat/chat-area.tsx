/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Bot, Info, Mic, Palette, Paperclip, Search, Send } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
// 1. Import all the cool themes you want to offer
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
	a11yDark,
	darcula,
	dracula,
	nightOwl,
	nord,
	xonokai
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export interface ChatMessage {
	_id: string;
	role: 'user' | 'model';
	content: string;
	created_at: string | Date;
}

interface ChatAreaProps {
	title?: string;
	isParent?: boolean;
	isFirstWindow?: boolean;
	isLeaf?: boolean;
	messages?: ChatMessage[];
	isLoading?: boolean;
}

const formatTime = (dateString: string | Date) => {
	return new Date(dateString).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	});
};

// 2. Map the display names to the actual theme objects
const syntaxThemes: Record<string, any> = {
	'Night Owl': nightOwl,
	Nord: nord,
	Darcula: darcula,
	Dracula: dracula,
	a11yDark: a11yDark,
	xonokai: xonokai
};

export const ChatArea = ({
	title = 'Chat',
	isParent = false,
	isFirstWindow = true,
	isLeaf = true,
	messages = [],
	isLoading = false
}: ChatAreaProps) => {
	// 3. Set up the state to track the active syntax theme
	const [activeSyntaxTheme, setActiveSyntaxTheme] = useState<string>('Nord');

	return (
		<div
			className={`flex flex-col h-full w-full relative ${isParent ? 'bg-muted/10' : 'bg-background'}`}
		>
			{/* Top Header */}
			<header className="flex items-center justify-between px-6 h-18.25 border-b border-border bg-background shrink-0 min-w-0">
				<div className="flex items-center gap-2 min-w-0 flex-1 pr-4">
					<SidebarTrigger
						className={`sm:hidden ${isFirstWindow ? 'md:flex' : 'md:hidden'} justify-center items-center h-10 w-10`}
					/>
					<h1 className="text-[1.1rem] font-semibold text-foreground truncate">
						{title}
					</h1>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					{/* 4. THEME SWITCHER DROPDOWN */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground"
								title="Change Code Theme"
							>
								<Palette className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-48 bg-popover text-popover-foreground border-border shadow-md"
						>
							<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Code Theme
							</div>
							{Object.keys(syntaxThemes).map((themeName) => (
								<DropdownMenuItem
									key={themeName}
									onClick={() => setActiveSyntaxTheme(themeName)}
									className={`cursor-pointer transition-colors ${activeSyntaxTheme === themeName ? 'bg-primary/20 text-primary font-medium' : ''}`}
								>
									{themeName}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<Search className="h-5 w-5" />
					</Button>
				</div>
			</header>

			{/* Messages Area */}
			<div
				className={`flex-1 overflow-y-auto px-4 lg:px-12 py-6 ${!isParent && isLeaf ? 'mb-24' : 'mb-4'}`}
			>
				<div
					key={title}
					className="flex flex-col gap-8 max-w-4xl mx-auto pb-24"
				>
					{isLoading ? (
						<div
							key="loading-skeleton"
							className="flex flex-col gap-8 w-full animate-in fade-in duration-300"
						>
							{/* Skeleton loader for a user message */}
							<div className="flex gap-4 mt-4">
								<Skeleton className="h-8 w-8 rounded-full shrink-0 mt-1" />
								<div className="flex flex-col gap-2 mt-1 w-full">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-12" />
										<Skeleton className="h-3 w-16" />
									</div>
									<Skeleton className="h-4 w-full max-w-md" />
									<Skeleton className="h-4 w-5/6 max-w-sm" />
								</div>
							</div>
							{/* Skeleton loader for a bot message with pseudo-code block */}
							<div className="flex gap-4 mt-6">
								<Skeleton className="h-8 w-8 rounded-full shrink-0 mt-1" />
								<div className="flex flex-col gap-2 mt-1 w-full">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-16" />
									</div>
									<Skeleton className="h-4 w-full max-w-2xl" />
									<Skeleton className="h-4 w-11/12 max-w-2xl" />
									<Skeleton className="h-4 w-4/5 max-w-xl" />
									<Skeleton className="h-32 w-full max-w-2xl rounded-xl mt-2" />
								</div>
							</div>
						</div>
					) : (
						<div
							key="loaded-content"
							className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out"
						>
							{messages.length > 0 && (
								<div className="text-center text-xs text-muted-foreground my-4 font-medium">
									{new Date(messages[0].created_at).toLocaleDateString(
										undefined,
										{
											weekday: 'long',
											month: 'short',
											day: 'numeric'
										}
									)}
								</div>
							)}

							{messages.map((msg) => (
								<div key={msg._id} className="flex gap-4">
									<Avatar className="h-8 w-8 shrink-0 mt-1">
										{msg.role === 'user' ? (
											<>
												<AvatarImage src="https://i.pravatar.cc/440?img=13" />
												<AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
													You
												</AvatarFallback>
											</>
										) : (
											<AvatarFallback className="bg-primary text-primary-foreground">
												<Bot className="h-5 w-5" />
											</AvatarFallback>
										)}
									</Avatar>

									<div className="flex flex-col gap-1.5 mt-1 w-full overflow-hidden">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-[0.95rem] text-foreground">
												{msg.role === 'user' ? 'You' : 'ForkTreeAI'}
											</span>
											<span className="text-xs text-muted-foreground font-medium">
												{formatTime(msg.created_at)}
											</span>
										</div>

										{msg.role === 'user' ? (
											<p className="text-foreground text-[0.95rem] leading-relaxed whitespace-pre-wrap">
												{msg.content}
											</p>
										) : (
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												components={{
													pre({ children }: any) {
														return <>{children}</>;
													},
													code({ node, className, children, ...props }: any) {
														const match = /language-(\w+)/.exec(
															className || ''
														);

														if (match) {
															return (
																<div className="not-prose my-6 rounded-xl overflow-hidden border border-border/50 bg-sidebar shadow-md">
																	<div className="flex items-center justify-between px-4 py-2 bg-black/10 border-b border-border/20">
																		<span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider select-none">
																			{match[1]}
																		</span>
																	</div>
																	<SyntaxHighlighter
																		{...props}
																		// 5. Pass the dynamically selected theme object here!
																		style={syntaxThemes[activeSyntaxTheme]}
																		language={match[1]}
																		PreTag="div"
																		className="text-[0.95rem] md:text-base overflow-x-auto"
																		customStyle={{
																			margin: 0,
																			padding: '1.25rem',
																			backgroundColor: 'transparent',
																			border: 'none',
																			boxShadow: 'none'
																		}}
																	>
																		{String(children).replace(/\n$/, '')}
																	</SyntaxHighlighter>
																</div>
															);
														}

														return (
															<code
																{...props}
																className="bg-muted/60 text-foreground px-1.5 py-0.5 rounded-md text-[0.95em] font-mono before:content-none after:content-none"
															>
																{children}
															</code>
														);
													}
												}}
											>
												{msg.content}
											</ReactMarkdown>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Input Area */}
			{!isParent && isLeaf && (
				<div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-background via-background to-transparent pt-6 pb-6 px-4 lg:px-12 pointer-events-none">
					<div className="max-w-4xl mx-auto flex items-center bg-primary rounded-2xl p-2 pr-4 shadow-lg pointer-events-auto">
						<Button
							variant="ghost"
							size="icon"
							className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-xl h-10 w-10"
						>
							<Paperclip className="h-5 w-5" />
						</Button>
						<Input
							className="flex-1 bg-transparent border-0 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-0 shadow-none px-2 text-base"
							placeholder="Type something..."
						/>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-xl h-10 w-10"
							>
								<Mic className="h-5 w-5" />
							</Button>
							<Button
								size="icon"
								className="bg-transparent hover:bg-primary-foreground/10 text-primary-foreground rounded-xl h-10 w-10"
							>
								<Send className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
