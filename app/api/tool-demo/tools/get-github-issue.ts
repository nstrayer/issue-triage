import { z } from 'zod';
import { GetGithubIssueArgs } from '@/app/types/tools';
import { githubService } from '@/app/services/github';

export const getGithubIssue = {
    description: 'Get a specific GitHub issue by its number',
    parameters: z.object({
        issueNumber: z.number().describe('The issue number to fetch')
    }),
    execute: async ({ issueNumber }: GetGithubIssueArgs) => {
        try {
            return await githubService.getIssue(issueNumber);
        } catch (error) {
            console.error('Error fetching GitHub issue:', error);
            return `Error: Unable to fetch issue #${issueNumber}. The issue might not exist.`;
        }
    },
}; 