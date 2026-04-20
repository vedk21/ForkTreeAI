import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

interface PageNotFoundProps {
	is404: boolean;
	message: string;
	details: string;
}

const PageNotFound = ({ is404, message, details }: PageNotFoundProps) => {
	return (
		<main className="flex flex-col items-center justify-center min-h-screen bg-background">
			{is404 && (
				<div className="mb-4 md:mb-8">
					<img
						src="/images/monster-404-error.svg"
						alt="Page Not Found"
						className="mx-auto w-48 md:w-60 lg:w-72 h-auto"
					/>
				</div>
			)}
			{!is404 && (
				<div className="mb-4 md:mb-8">
					<img
						src="/images/oops-error-occured.svg"
						alt="Error Occurred"
						className="mx-auto w-48 md:w-60 lg:w-72 h-auto"
					/>
				</div>
			)}
			<h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 mx-4 text-accent">
				{message}
			</h1>
			<p className="text-center text-sm md:text-lg mb-4 md:mb-6 mx-4 text-secondary">
				{details}
			</p>
			{is404 && (
				<Button asChild>
					<Link to="/">Go to Homepage</Link>
				</Button>
			)}
		</main>
	);
};

export default PageNotFound;
