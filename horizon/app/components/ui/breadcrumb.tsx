import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Breadcrumb = ({ className, ...props }: React.ComponentProps<'nav'>) => (
	<nav
		aria-label="breadcrumb"
		data-slot="breadcrumb"
		className={cn(className)}
		{...props}
	/>
);

const BreadcrumbList = ({
	className,
	...props
}: React.ComponentProps<'ol'>) => (
	<ol
		data-slot="breadcrumb-list"
		className={cn(
			'flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground',
			className
		)}
		{...props}
	/>
);

const BreadcrumbItem = ({
	className,
	...props
}: React.ComponentProps<'li'>) => (
	<li
		data-slot="breadcrumb-item"
		className={cn('inline-flex items-center gap-1', className)}
		{...props}
	/>
);

const BreadcrumbLink = ({
	asChild,
	className,
	...props
}: React.ComponentProps<'a'> & {
	asChild?: boolean;
}) => {
	const Comp = asChild ? Slot.Root : 'a';

	return (
		<Comp
			data-slot="breadcrumb-link"
			className={cn('transition-colors hover:text-secondary', className)}
			{...props}
		/>
	);
};

const BreadcrumbPage = ({
	className,
	...props
}: React.ComponentProps<'span'>) => (
	<span
		data-slot="breadcrumb-page"
		role="link"
		aria-disabled="true"
		aria-current="page"
		className={cn('font-normal text-foreground', className)}
		{...props}
	/>
);

const BreadcrumbSeparator = ({
	children,
	className,
	...props
}: React.ComponentProps<'li'>) => (
	<li
		data-slot="breadcrumb-separator"
		role="presentation"
		aria-hidden="true"
		className={cn('[&>svg]:size-3.5', className)}
		{...props}
	>
		{children ?? <ChevronRightIcon />}
	</li>
);

const BreadcrumbEllipsis = ({
	className,
	...props
}: React.ComponentProps<'span'>) => (
	<span
		data-slot="breadcrumb-ellipsis"
		role="presentation"
		aria-hidden="true"
		className={cn(
			'flex size-5 items-center justify-center [&>svg]:size-4',
			className
		)}
		{...props}
	>
		<MoreHorizontalIcon />
		<span className="sr-only">More</span>
	</span>
);

export {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
};
