import { z } from 'zod';
import { SearchIssuesByLabelsArgs } from '@/app/types/tools';
import { githubService } from '@/app/services/github';

export const searchIssuesByLabels = {
    description: 'Search for GitHub issues with specific labels. Returns most recent issues first.',
    parameters: z.object({
        labels: z.array(z.string()).describe('Array of label names to search for'),
        limit: z.number().min(1).max(20).describe('Number of issues to return (max 20)')
    }),
    execute: async ({ labels, limit }: SearchIssuesByLabelsArgs) => {
        try {
            const issues = await githubService.fetchIssues({
                labels,
                devPageLimit: Math.ceil(limit / 100)
            });

            return {
                total: Math.min(issues.length, limit),
                issues: issues.slice(0, limit)
            };
        } catch (error) {
            console.error('Error searching issues by labels:', error);
            return 'Error searching issues by labels';
        }
    }
}; 