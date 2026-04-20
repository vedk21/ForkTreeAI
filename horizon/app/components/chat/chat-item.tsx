import { Book } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ChatItemProps {
	title: string;
	preview: string;
	time: string;
	active?: boolean;
	onClick?: () => void;
}

export const ChatItem = ({
	title,
	preview,
	time,
	active,
	onClick
}: ChatItemProps) => {
	return (
		<div
			onClick={onClick}
			className={cn(
				'p-3 rounded-xl cursor-pointer transition-colors',
				active
					? 'bg-primary text-primary-foreground'
					: 'hover:bg-muted text-foreground'
			)}
		>
			<div className="flex justify-between items-center mb-1">
				<div className="flex items-center gap-2 font-medium text-sm">
					<Book className="h-4 w-4" />
					<span>{title}</span>
				</div>
				<span
					className={cn(
						'text-xs',
						active ? 'text-primary-foreground/80' : 'text-muted-foreground'
					)}
				>
					{time}
				</span>
			</div>
			<p
				className={cn(
					'text-xs truncate',
					active ? 'text-primary-foreground/80' : 'text-muted-foreground'
				)}
			>
				{preview}
			</p>
		</div>
	);
};
