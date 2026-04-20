import {
	Book,
	Gamepad2,
	LayoutDashboard,
	MessageSquare,
	Music,
	Plane,
	Plus,
	Users
} from 'lucide-react';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { Button } from '@/components/ui/button';

export const SidebarRail = () => {
	const navItems = [
		{ icon: MessageSquare, active: true },
		{ icon: LayoutDashboard },
		{ icon: Users },
		{ icon: Book },
		{ icon: Gamepad2 },
		{ icon: Music },
		{ icon: Plane }
	];

	return (
		<div className="flex flex-col items-center py-4 justify-between h-full w-full">
			<div className="flex flex-col items-center gap-4 w-full">
				{/* Logo/Brand Icon */}
				<div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center mb-4">
					<MessageSquare className="h-5 w-5" />
				</div>

				<div className="flex-1 w-full overflow-y-auto min-h-0 hide-scrollbar">
					<div className="flex flex-col items-center gap-3 py-2">
						{navItems.map((item, index) => (
							<Button
								key={index}
								variant="ghost"
								size="icon"
								className={`rounded-xl h-11 w-11 transition-colors ${
									item.active
										? 'bg-primary/20 text-primary hover:bg-primary/30'
										: 'text-muted-foreground hover:text-foreground hover:bg-muted'
								}`}
							>
								<item.icon className="h-5 w-5" />
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* Bottom Actions */}
			<div className="flex flex-col items-center gap-4 mt-auto">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-xl bg-background shadow-sm border border-border text-foreground h-11 w-11 hover:bg-muted"
				>
					<Plus className="h-5 w-5" />
				</Button>
				<ThemeToggle />
			</div>
		</div>
	);
};
