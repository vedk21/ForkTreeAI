import { type ReactNode } from 'react';

import { ChatHistoryList } from '@/components/chat/chat-history-list';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const ChatLayout = ({ children }: { children: ReactNode }) => {
	return (
		<SidebarProvider>
			{/* The Sidebar component */}
			<ChatHistoryList />

			{/* SidebarInset wraps the main dynamic content */}
			<SidebarInset className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden h-screen transition-colors duration-300">
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
};
