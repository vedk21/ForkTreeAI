import './app.css';

import { useLayoutEffect } from 'react';
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration
} from 'react-router';

import PageNotFound from '@/components/common/page-not-found';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/theme-provider';

import type { Route } from './+types/root';

export const links: Route.LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous'
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap'
	}
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
	useLayoutEffect(() => {
		// Apply theme
		const theme = localStorage.getItem('theme') || 'dark';
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(theme);
	}, []);

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>ForkTreeAI</title>
				<Meta />
				<Links />
			</head>
			<body>
				<ThemeProvider defaultTheme="dark" storageKey="fingroww-app-theme">
					{children}
					<Toaster position="top-right" />
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
};

const App = () => <Outlet />;
export default App;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
	const is404 = isRouteErrorResponse(error) && error.status === 404;
	const message = is404 ? '404 - Page Not Found' : 'Oops!';
	const details = is404
		? 'Sorry, the page you are looking for does not exist or has been moved.'
		: isRouteErrorResponse(error)
			? error.statusText || 'An unexpected error occurred.'
			: error instanceof Error
				? error.message
				: 'An unexpected error occurred.';

	return <PageNotFound is404={is404} message={message} details={details} />;
};
