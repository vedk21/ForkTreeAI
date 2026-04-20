import { IconSailboat } from '@tabler/icons-react';
import {
	AudioLines,
	Crown,
	FlameKindling,
	Moon,
	Shapes,
	Sun
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { useTheme } from '@/context/theme-provider';

export const ThemeToggle: React.FC = () => {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<TooltipProvider delayDuration={0}>
				<Tooltip delayDuration={400}>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<Sun
									className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 nebula:scale-0 nebula:-rotate-90 caribbean:scale-0 caribbean:-rotate-90 wilderness:scale-0 wilderness:-rotate-90 blue2:scale-0 blue2:-rotate-90 vibrant:scale-0 vibrant:-rotate-90"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<Moon
									className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 nebula:scale-0 nebula:-rotate-90 caribbean:scale-0 caribbean:-rotate-90 wilderness:scale-0 wilderness:-rotate-90 blue2:scale-0 blue2:-rotate-90 vibrant:scale-0 vibrant:-rotate-90"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<Crown
									className="absolute scale-0 rotate-180 transition-all nebula:scale-100 nebula:rotate-0"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<IconSailboat
									className="absolute scale-0 rotate-90 transition-all caribbean:scale-100 caribbean:rotate-0"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<FlameKindling
									className="absolute scale-0 rotate-90 transition-all wilderness:scale-100 wilderness:rotate-0"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<Shapes
									className="absolute scale-0 rotate-90 transition-all blue2:scale-100 blue2:rotate-0"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<AudioLines
									className="absolute scale-0 rotate-90 transition-all vibrant:scale-100 vibrant:rotate-0"
									style={{
										width: 'var(--icon-size)',
										height: 'var(--icon-size)'
									}}
								/>
								<span className="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="bottom" align="center" className="lg:text-base">
						Theme Toggle
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<DropdownMenuContent
				className="mr-3"
				align="center"
				onCloseAutoFocus={(event) => {
					// stop Radix from focusing the trigger button
					event.preventDefault();
				}}
			>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<span className="w-3 h-3 rounded-md bg-[#171717]"></span>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<span className="w-3 h-3 rounded-md bg-[#D8E1FC]"></span>Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('nebula')}>
					<span className="w-3 h-3 rounded-md bg-[#7040da]"></span>
					Nebula
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('caribbean')}>
					<span className="w-3 h-3 rounded-md bg-[#02868A]"></span>Caribbean
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('wilderness')}>
					<span className="w-3 h-3 rounded-md bg-[#255c32]"></span>Wilderness
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('blue2')}>
					<span className="w-3 h-3 rounded-md bg-[#5C5C99]"></span>Blue2
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('vibrant')}>
					<span className="w-3 h-3 rounded-md bg-[#054BBC]"></span>Vibrant
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<span className="w-3 h-3 rounded-md bg-[#D8E1FC]"></span>System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
