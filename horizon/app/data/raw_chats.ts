import { type ChatTreeItem } from '@/lib/chat/helper';

export const chatData: ChatTreeItem[] = [
	{
		id: 'api-auth',
		name: 'API authentication implementation details',
		time: '2h',
		conversation_id: '1',
		children: [
			{
				id: 'branch-jwt',
				name: 'Branch: JWT implementation guide',
				time: '1h',
				conversation_id: '1',
				children: [
					{
						id: 'branch-jwt-refresh',
						name: 'Sub-branch: Refresh token rotation strategy',
						time: '45m',
						conversation_id: '1',
						children: [
							{
								id: 'branch-jwt-security',
								name: 'Discussion: Handling compromised refresh tokens',
								time: '30m',
								conversation_id: '1',
								children: [
									{
										id: 'branch-jwt-solution',
										name: 'Solution: Redis blocklist implementation code',
										time: '15m',
										conversation_id: '1'
									}
								]
							}
						]
					}
				]
			},
			{
				id: 'branch-oauth',
				name: 'Branch: OAuth 2.0 flow setup for Google and GitHub',
				time: '10m',
				conversation_id: '1'
			}
		]
	},
	{
		id: 'market-research',
		name: 'Market research: Q4 2026 Analysis and Projections',
		time: '1d',
		conversation_id: '2',
		children: [
			{
				id: 'branch-ai',
				name: 'Branch: AI integration strategy for enterprise clients',
				time: '12h',
				conversation_id: '2'
			}
		]
	},
	{
		id: 'blog-post',
		name: 'Blog post: 5 productivity tips for remote software engineers',
		time: '3d',
		conversation_id: '3',
		children: [
			{
				id: 'branch-casual',
				name: 'Branch: Casual tone version for social media sharing',
				time: '2d',
				conversation_id: '3'
			},
			{
				id: 'branch-pro',
				name: 'Branch: Professional tone version for LinkedIn publishing',
				time: '1d',
				conversation_id: '3'
			}
		]
	}
];
