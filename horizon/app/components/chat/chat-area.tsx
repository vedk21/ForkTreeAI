import { Mic, Paperclip, Search, Send } from 'lucide-react';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const ChatArea = () => {
	return (
		<div className="flex flex-col h-full w-full relative">
			{/* Top Header */}
			<header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
				<div className="flex items-center gap-2">
					{/* ADD THIS TRIGGER: It only shows up on mobile/collapsed states automatically! */}
					<SidebarTrigger className="sm:hidden md:flex justify-center items-center h-10 w-10" />
					<h1 className="text-xl font-semibold">Python</h1>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<Search className="h-5 w-5" />
					</Button>
					<ThemeToggle />
				</div>
			</header>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto px-4 lg:px-12 py-6">
				<div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24">
					<div className="text-center text-xs text-muted-foreground my-4 font-medium">
						Today
					</div>

					{/* User Message */}
					<div className="flex gap-4">
						<Avatar className="h-8 w-8">
							<AvatarImage src="https://i.pravatar.cc/901?img=33" />
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
							<p className="text-foreground">Write a primitive code</p>
						</div>
					</div>

					{/* AI Response */}
					<div className="flex gap-4">
						<Avatar className="h-8 w-8">
							<AvatarImage src="https://api.dicebear.com/9.x/bottts/svg" />
							<AvatarFallback className="bg-primary text-primary-foreground">
								AI
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-3 mt-1 flex-1">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-sm text-foreground">
									ChatGPT
								</span>
								<span className="text-xs text-muted-foreground">10:12 AM</span>
							</div>
							<p className="text-foreground">
								Sure, here&apos;s an example of a primitive code in Python that
								takes a user input, performs a calculation, and prints the
								result to the console:
							</p>

							{/* Code Block Representation */}
							<div className="bg-accent/50 border border-border rounded-2xl p-4 font-mono text-sm text-foreground">
								<span className="text-muted-foreground">
									# Get input from the user
								</span>
								<br />
								number1 = float(input(&quot;Enter the first number: &quot;))
								<br />
								number2 = float(input(&quot;Enter the second number: &quot;))
								<br />
								<br />
								<span className="text-muted-foreground">
									# Perform a calculation
								</span>
								<br />
								result = (number1 + number2) / 2
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Input Area */}
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
		</div>
	);
};
