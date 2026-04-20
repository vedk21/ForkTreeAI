import type { MetaFunction } from 'react-router';

import { ChatArea } from '@/components/chat/chat-area';
import { ChatLayout } from '@/layouts/chat-layout';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Horizon Chat' },
		{ name: 'description', content: 'AI Chat Interface' }
	];
};

const Index = () => {
	return (
		<ChatLayout>
			<ChatArea />
		</ChatLayout>
	);
};

export default Index;
