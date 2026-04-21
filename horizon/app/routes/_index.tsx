import type { MetaFunction } from 'react-router';

import { ChatLayout } from '@/layouts/chat-layout';

export const meta: MetaFunction = () => {
	return [
		{ title: 'ForkTreeAI' },
		{ name: 'description', content: 'AI Chat Interface' }
	];
};

const Index = () => {
	return <ChatLayout />;
};

export default Index;
