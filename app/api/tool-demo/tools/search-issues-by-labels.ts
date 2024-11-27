import { z } from 'zod';
import { SearchIssuesByLabelsArgs } from '@/app/types/tools';
import { getGitHubClient, REPO_OWNER, REPO_NAME } from '../github-client';

export const searchIssuesByLabels = {
    description: 'Search for GitHub issues with specific labels. Returns most recent issues first.',
    parameters: z.object({
        labels: z.array(z.string()).describe('Array of label names to search for'),
        limit: z.number().min(1).max(20).describe('Number of issues to return (max 20)')
    }),
    execute: async ({ labels, limit }: SearchIssuesByLabelsArgs) => {
        try {
            const octokit = getGitHubClient();

            // Convert array of labels to comma-separated string for GitHub API
            const labelQuery = labels.join(',');

            const response = await octokit.issues.listForRepo({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                labels: labelQuery,
                state: 'all', // Get both open and closed issues
                per_page: limit,
                sort: 'created',
                direction: 'desc'
            });

            const issues = response.data.map(issue => ({
                number: issue.number,
                title: issue.title,
                body: issue.body,
                state: issue.state,
                created_at: issue.created_at,
                labels: issue.labels.map(label => ({
                    name: typeof label === 'string' ? label : label.name,
                    color: typeof label === 'string' ? '' : label.color
                }))
            }));

            return {
                total: issues.length,
                issues
            };
        } catch (error) {
            console.error('Error searching issues by labels:', error);
            return 'Error searching issues by labels';
        }
    },
}; 