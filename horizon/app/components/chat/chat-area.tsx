import { Mic, Paperclip, Search, Send } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface ChatAreaProps {
	title?: string;
	isParent?: boolean;
	isFirstWindow?: boolean;
	// 1. ADD: isLeaf prop
	isLeaf?: boolean;
}

export const ChatArea = ({
	title = 'Chat',
	isParent = false,
	isFirstWindow = true,
	// Default to true so it shows up if not explicitly told otherwise
	isLeaf = true
}: ChatAreaProps) => {
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

				<div className="flex items-center gap-3 shrink-0">
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
			<div className="flex-1 overflow-y-auto px-4 lg:px-12 py-6">
				<div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24">
					<div className="text-center text-xs text-muted-foreground my-4 font-medium">
						Today
					</div>

					{/* Placeholder content for visualization */}
					<div className="flex gap-4">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="bg-secondary text-secondary-foreground">
								You
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-1 mt-1">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-sm text-foreground">
									You
								</span>
								<span className="text-xs text-muted-foreground">10:12 AM</span>
							</div>
							<p className="text-foreground text-sm">
								Example prompt goes here...
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* 2. UPDATE CONDITION: Only render if it is NOT a parent AND it IS a leaf node */}
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
