/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
	Bot,
	ChevronDown,
	ChevronUp,
	GitBranch,
	Mic,
	Palette,
	Paperclip,
	Search,
	Send,
	Sparkles,
	Zap
} from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
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
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Kbd } from '@/components/ui/kbd';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';

/** optional keys id or _id  */
export interface ChatMessage {
	_id: string;
	id?: string;
	role: 'user' | 'model';
	content: string;
	created_at: string | Date;
	parent_id?: string | null;
}

interface ChatAreaProps {
	title?: string;
	breadcrumbs?: { id: string; name: string }[];
	onSelectBreadcrumb?: (id: string) => void;
	isParent?: boolean;
	isFirstWindow?: boolean;
	isLeaf?: boolean;
	messages?: ChatMessage[];
	isLoading?: boolean;
	isSending?: boolean;
	onSendMessage?: (content: string, model: string) => void;
	onForkMessage?: (
		parentId: string | null,
		isLast: boolean,
		model: string
	) => void;
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

const MODEL_NAMES: Record<string, string> = {
	'gemini-2.5-flash': 'Gemini 2.5 Flash',
	'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
	'gemini-2-flash': 'Gemini 2.0 Flash',
	'gemini-2-flash-lite': 'Gemini 2.0 Flash Lite'
};

export const ChatArea = ({
	title = 'Chat',
	breadcrumbs = [],
	onSelectBreadcrumb,
	isParent = false,
	isFirstWindow = true,
	isLeaf = true,
	messages = [],
	isLoading = false,
	isSending = false,
	onSendMessage,
	onForkMessage
}: ChatAreaProps) => {
	// 3. Set up the state to track the active syntax theme
	const [activeSyntaxTheme, setActiveSyntaxTheme] =
		useState<string>('Night Owl');
	const [inputValue, setInputValue] = useState('');
	const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
	const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSend = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!inputValue.trim() || isSending) return;
		onSendMessage?.(inputValue, selectedModel);
		setInputValue('');
	};

	// Auto-scroll to the last user question
	useEffect(() => {
		const userMsgs = [...messages].filter((m) => m.role === 'user');
		if (userMsgs.length > 0) {
			const lastIdx = userMsgs.length - 1;
			setActiveQuestionIndex(lastIdx);
			// Scroll so the last question is placed at the top of the viewing area
			const el = document.getElementById(`message-${userMsgs[lastIdx]._id}`);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		} else {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, isSending]);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
		}
	}, [inputValue]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const userMessages = messages.filter((m) => m.role === 'user');

	const scrollToMessage = (id: string, index: number) => {
		setActiveQuestionIndex(index);
		const el = document.getElementById(`message-${id}`);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	const handlePrevQuestion = () => {
		if (activeQuestionIndex > 0) {
			scrollToMessage(
				userMessages[activeQuestionIndex - 1]._id,
				activeQuestionIndex - 1
			);
		}
	};

	const handleNextQuestion = () => {
		if (activeQuestionIndex < userMessages.length - 1) {
			scrollToMessage(
				userMessages[activeQuestionIndex + 1]._id,
				activeQuestionIndex + 1
			);
		}
	};

	return (
		<div
			className={`flex flex-col h-full w-full relative ${isParent ? 'bg-muted/10' : 'bg-background'}`}
		>
			{/* Top Header */}
			<header className="flex items-center justify-between px-6 h-18.25 border-b border-border bg-background shrink-0 min-w-0">
				<div className="flex items-center gap-2 min-w-0 flex-1 pr-4 overflow-hidden">
					<SidebarTrigger
						className={`sm:hidden ${isFirstWindow ? 'md:flex' : 'md:hidden'} justify-center items-center h-10 w-10 shrink-0`}
					/>
					{breadcrumbs && breadcrumbs.length > 0 ? (
						<Breadcrumb className="truncate">
							<BreadcrumbList className="flex-nowrap whitespace-nowrap overflow-hidden text-ellipsis">
								{breadcrumbs.map((crumb, idx) => {
									const isLast = idx === breadcrumbs.length - 1;
									const isFirst = idx === 0;
									const isPenultimate = idx === breadcrumbs.length - 2;

									const shouldShow =
										breadcrumbs.length <= 3 ||
										isFirst ||
										isLast ||
										isPenultimate;
									const showEllipsis = breadcrumbs.length > 3 && idx === 1;

									if (!shouldShow && !showEllipsis) return null;

									if (showEllipsis) {
										// Extract all the intermediate breadcrumbs that are being hidden
										const hiddenBreadcrumbs = breadcrumbs.slice(
											1,
											breadcrumbs.length - 2
										);
										return (
											<Fragment key={`ellipsis-${crumb.id}`}>
												<BreadcrumbItem>
													<DropdownMenu>
														<DropdownMenuTrigger className="flex items-center outline-none rounded hover:bg-muted/50 transition-colors p-1">
															<BreadcrumbEllipsis className="h-4 w-4" />
															<span className="sr-only">Toggle menu</span>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="start"
															className="bg-popover text-popover-foreground border-border shadow-md max-w-[200px] sm:max-w-[300px]"
														>
															{hiddenBreadcrumbs.map((hiddenCrumb) => (
																<DropdownMenuItem
																	key={hiddenCrumb.id}
																	className="cursor-pointer truncate block w-full text-left"
																	onClick={() =>
																		onSelectBreadcrumb?.(hiddenCrumb.id)
																	}
																>
																	{hiddenCrumb.name}
																</DropdownMenuItem>
															))}
														</DropdownMenuContent>
													</DropdownMenu>
												</BreadcrumbItem>
												<BreadcrumbSeparator />
											</Fragment>
										);
									}

									return (
										<Fragment key={crumb.id}>
											<BreadcrumbItem>
												{isLast ? (
													<BreadcrumbPage className="text-[1.05rem] font-semibold text-secondary">
														{crumb.name}
													</BreadcrumbPage>
												) : (
													<BreadcrumbLink
														asChild
														className="cursor-pointer"
														onClick={(e) => {
															e.preventDefault();
															onSelectBreadcrumb?.(crumb.id);
														}}
													>
														<span
															className="truncate max-w-[90px] sm:max-w-[150px] hover:text-foreground transition-colors"
															title={crumb.name}
														>
															{crumb.name}
														</span>
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
											{!isLast && <BreadcrumbSeparator />}
										</Fragment>
									);
								})}
							</BreadcrumbList>
						</Breadcrumb>
					) : (
						<h1 className="text-[1.1rem] font-semibold text-foreground truncate">
							{title}
						</h1>
					)}
				</div>

				<div className="flex items-center gap-3 shrink-0">
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
								<div
									key={msg._id}
									id={`message-${msg._id}`}
									className="flex gap-4 scroll-mt-24"
								>
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
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center justify-start gap-2">
												<span className="font-bold text-base text-secondary">
													{msg.role === 'user' ? 'You' : 'ForkTreeAI'}
												</span>
												<span className="text-sm text-muted-foreground/40 font-medium">
													{formatTime(msg.created_at)}
												</span>
											</div>
											{msg.role === 'user' && (
												<div className="flex items-center justify-end">
													<Button
														variant="ghost"
														size="sm"
														className="h-6 py-4 px-2 text-sm font-medium mx-2 text-primary hover:text-primary hover:bg-primary/30 rounded-md"
														onClick={() => {
															const isLast =
																userMessages[userMessages.length - 1]._id ===
																msg._id;
															onForkMessage?.(
																msg.parent_id || null,
																isLast,
																selectedModel
															);
														}}
													>
														<GitBranch className="h-3 w-3 mr-1" />
														Start New Path
													</Button>
												</div>
											)}
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

							{isSending && (
								<div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
									<Avatar className="h-8 w-8 shrink-0 mt-1">
										<AvatarFallback className="bg-primary text-primary-foreground animate-pulse">
											<Bot className="h-5 w-5" />
										</AvatarFallback>
									</Avatar>

									<div className="flex flex-col gap-1.5 mt-1 w-full overflow-hidden">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-[0.95rem] text-foreground">
												ForkTreeAI
											</span>
											<span className="text-xs text-muted-foreground font-medium animate-pulse">
												typing...
											</span>
										</div>

										<div className="flex flex-col gap-2 mt-2 w-full max-w-2xl">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-5/6" />
											<Skeleton className="h-4 w-4/6" />
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>
			</div>

			{/* Input Area */}
			{!isParent && isLeaf && (
				<div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-background via-background to-transparent pt-6 pb-6 px-4 lg:px-12 pointer-events-none">
					<form
						onSubmit={handleSend}
						className="max-w-4xl mx-auto flex flex-col bg-sidebar border border-border shadow-xl rounded-3xl p-2 pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 relative"
					>
						<textarea
							ref={textareaRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isSending}
							rows={1}
							className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none px-3 py-3 min-h-11 max-h-25 overflow-y-auto text-[0.95rem] leading-relaxed scrollbar-thin"
							placeholder="Ask anything..."
						/>
						<div className="flex items-center justify-between px-1 pb-1">
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-foreground rounded-xl h-9 w-9 shrink-0"
								>
									<Paperclip className="h-5 w-5" />
								</Button>
								<span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/75 select-none">
									<Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> to add a new line
								</span>
							</div>

							<div className="flex items-center gap-1">
								<Select value={selectedModel} onValueChange={setSelectedModel}>
									<SelectTrigger className="h-8 w-fit min-w-32.5 max-w-55 bg-transparent text-[0.8rem] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border-0">
										<SelectValue placeholder="Select Model">
											{MODEL_NAMES[selectedModel] || 'Select Model'}
										</SelectValue>
									</SelectTrigger>
									<SelectContent
										side="top"
										align="end"
										className="w-[320px] max-h-75 overflow-y-auto scrollbar-thin p-2 bg-popover text-popover-foreground border-border shadow-xl rounded-xl"
									>
										<SelectGroup>
											<SelectLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
												Gemini 2.5 (Latest)
											</SelectLabel>
											<SelectItem
												value="gemini-2.5-flash"
												className="p-2 mb-1 cursor-pointer rounded-lg items-start"
											>
												<div className="flex items-start gap-3">
													<div className="mt-0.5 bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
														<Zap className="h-4 w-4" />
													</div>
													<div className="flex flex-col text-left">
														<span className="font-semibold text-foreground text-sm leading-none mb-1">
															Gemini 2.5 Flash
														</span>
														<span className="text-xs text-muted-foreground whitespace-normal leading-snug">
															Fast and versatile performance for complex
															multi-step tasks
														</span>
													</div>
												</div>
											</SelectItem>
											<SelectItem
												value="gemini-2.5-flash-lite"
												className="p-2 cursor-pointer rounded-lg items-start"
											>
												<div className="flex items-start gap-3">
													<div className="mt-0.5 bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
														<Sparkles className="h-4 w-4" />
													</div>
													<div className="flex flex-col text-left">
														<span className="font-semibold text-foreground text-sm leading-none mb-1">
															Gemini 2.5 Flash Lite
														</span>
														<span className="text-xs text-muted-foreground whitespace-normal leading-snug">
															Lightweight, highly efficient, and fast for simple
															queries
														</span>
													</div>
												</div>
											</SelectItem>
										</SelectGroup>

										<SelectSeparator className="my-2 bg-border/50" />

										<SelectGroup>
											<SelectLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
												Gemini 2.0 (Legacy)
											</SelectLabel>
											<SelectItem
												value="gemini-2-flash"
												className="p-2 mb-1 cursor-pointer rounded-lg items-start"
											>
												<div className="flex items-start gap-3">
													<div className="mt-0.5 bg-muted p-1.5 rounded-md text-muted-foreground shrink-0">
														<Zap className="h-4 w-4" />
													</div>
													<div className="flex flex-col text-left">
														<span className="font-semibold text-foreground text-sm leading-none mb-1">
															Gemini 2.0 Flash
														</span>
														<span className="text-xs text-muted-foreground whitespace-normal leading-snug">
															Solid everyday performance and speed
														</span>
													</div>
												</div>
											</SelectItem>
											<SelectItem
												value="gemini-2-flash-lite"
												className="p-2 cursor-pointer rounded-lg items-start"
											>
												<div className="flex items-start gap-3">
													<div className="mt-0.5 bg-muted p-1.5 rounded-md text-muted-foreground shrink-0">
														<Sparkles className="h-4 w-4" />
													</div>
													<div className="flex flex-col text-left">
														<span className="font-semibold text-foreground text-sm leading-none mb-1">
															Gemini 2.0 Flash Lite
														</span>
														<span className="text-xs text-muted-foreground whitespace-normal leading-snug">
															Fastest responses for straightforward
															conversational tasks
														</span>
													</div>
												</div>
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-foreground rounded-xl h-9 w-9"
								>
									<Mic className="h-5 w-5" />
								</Button>
								<Button
									type="submit"
									disabled={isSending || !inputValue.trim()}
									size="icon"
									className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-9 w-9 disabled:opacity-50 transition-colors"
								>
									<Send className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</form>
				</div>
			)}

			{/* Quick Navigation (Timeline) */}
			{userMessages.length > 0 && (
				<div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex-col items-center gap-1 z-10 pointer-events-auto hidden md:flex">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
						onClick={handlePrevQuestion}
						disabled={activeQuestionIndex <= 0}
					>
						<ChevronUp className="h-4 w-4" />
					</Button>

					<TooltipProvider delayDuration={100}>
						{userMessages.map((msg, idx) => (
							<Tooltip key={msg._id}>
								<TooltipTrigger asChild>
									<button
										onClick={() => scrollToMessage(msg._id, idx)}
										className="group p-1.5 flex justify-center items-center outline-none"
										aria-label="Scroll to question"
									>
										<div
											className={`h-1.5 rounded-full transition-all duration-300 ${activeQuestionIndex === idx ? 'w-5 bg-primary' : 'w-3 bg-muted-foreground/40 group-hover:w-5 group-hover:bg-primary/70'}`}
										/>
									</button>
								</TooltipTrigger>
								<TooltipContent
									side="left"
									sideOffset={10}
									className="max-w-62.5 text-xs font-medium bg-popover text-popover-foreground shadow-md"
								>
									<p className="truncate">{msg.content}</p>
								</TooltipContent>
							</Tooltip>
						))}
					</TooltipProvider>

					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
						onClick={handleNextQuestion}
						disabled={activeQuestionIndex >= userMessages.length - 1}
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
};
