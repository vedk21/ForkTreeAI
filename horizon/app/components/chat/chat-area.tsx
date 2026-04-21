import { Bot, Info, Mic, Paperclip, Search, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// 1. Import Syntax Highlighter and the VS Code Dark theme
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

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
}

const formatTime = (dateString: string | Date) => {
	return new Date(dateString).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	});
};

export const ChatArea = ({
	title = 'Chat',
	isParent = false,
	isFirstWindow = true,
	isLeaf = true,
	messages = []
}: ChatAreaProps) => {
	return (
		<div
			className={`flex flex-col h-full w-full relative ${isParent ? 'bg-muted/10' : 'bg-background'}`}
		>
			{/* Top Header */}
			<header className="flex items-center justify-between px-6 h-[73px] border-b border-border bg-background shrink-0 min-w-0">
				<div className="flex items-center gap-2 min-w-0 flex-1 pr-4">
					<SidebarTrigger
						className={`sm:hidden ${isFirstWindow ? 'md:flex' : 'md:hidden'} justify-center items-center h-10 w-10`}
					/>
					<h1 className="text-[1.1rem] font-semibold text-foreground truncate">
						{title}
					</h1>
				</div>

				<div className="flex items-center gap-3 shrink-0">
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<Search className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<Info className="h-5 w-5" />
					</Button>
				</div>
			</header>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto px-4 lg:px-12 py-6">
				<div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24">
					{messages.length > 0 && (
						<div className="text-center text-xs text-muted-foreground my-4 font-medium">
							{new Date(messages[0].created_at).toLocaleDateString(undefined, {
								weekday: 'long',
								month: 'short',
								day: 'numeric'
							})}
						</div>
					)}

					{messages.map((msg) => (
						<div key={msg._id} className="flex gap-4">
							<Avatar className="h-8 w-8 shrink-0 mt-1">
								{msg.role === 'user' ? (
									<AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
										You
									</AvatarFallback>
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
									<div
										className="prose prose-sm md:prose-base max-w-none 
                                        prose-headings:text-foreground 
                                        prose-p:text-foreground/90 
                                        prose-strong:text-foreground 
                                        prose-em:text-foreground 
                                        prose-a:text-primary hover:prose-a:text-primary/80 
                                        prose-blockquote:border-primary 
                                        prose-blockquote:text-muted-foreground 
                                        prose-ul:text-foreground/90 
                                        prose-ol:text-foreground/90 
                                        prose-li:text-foreground/90 
                                        prose-th:text-foreground 
                                        prose-td:text-muted-foreground 
                                        prose-hr:border-border"
									>
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											// 2. Intercept and override the code rendering
											components={{
												// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
												code({ node, className, children, ...props }: any) {
													const match = /language-(\w+)/.exec(className || '');
													// If it has a language match (e.g., ```javascript), it's a code block
													if (match) {
														return (
															<SyntaxHighlighter
																{...props}
																style={nord}
																language={match[1]}
																PreTag="div"
																className="rounded-xl border border-border/20 shadow-md text-sm my-4"
																customStyle={{ margin: 0, padding: '1rem' }}
															>
																{String(children).replace(/\n$/, '')}
															</SyntaxHighlighter>
														);
													}
													// If there is no match, it's inline code (e.g., `const x = 1`)
													return (
														<code
															{...props}
															className="bg-muted/60 text-foreground px-1.5 py-0.5 rounded-md text-sm font-mono before:content-none after:content-none"
														>
															{children}
														</code>
													);
												}
											}}
										>
											{msg.content}
										</ReactMarkdown>
									</div>
								)}
							</div>
						</div>
					))}
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
