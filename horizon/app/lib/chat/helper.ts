import { type TreeDataItem } from '@/components/ui/tree-view';

export interface ChatTreeItem extends TreeDataItem {
	time?: string;
	conversation_id: string;
	children?: ChatTreeItem[];
}

export interface TreeViewNode {
	branch_id: string;
	name_of_branch: string;
	created_at: string;
	conversation_id: string;
	children?: TreeViewNode[];
}

export interface Message {
	id?: string;
	_id?: string;
	role: 'user' | 'model';
	content: string;
	created_at: string | Date;
}

// Helper function to find a chat and its immediate parent
export const getChatContext = (
	data: ChatTreeItem[],
	targetId: string,
	parent: ChatTreeItem | null = null
): { current: ChatTreeItem; parent: ChatTreeItem | null } | null => {
	for (const item of data) {
		if (item.id === targetId) {
			return { current: item, parent };
		}
		if (item.children) {
			const found = getChatContext(item.children, targetId, item);
			if (found) return found;
		}
	}
	return null;
};
