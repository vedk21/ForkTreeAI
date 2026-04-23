import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>) => {
	return (
		<div
			data-slot="skeleton"
			className={cn('animate-pulse rounded-md bg-secondary/40', className)}
			{...props}
		/>
	);
};

export { Skeleton };
