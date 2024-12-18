import { z } from 'zod';
import { GetDiscussionByIdArgs } from '@/app/types/tools';
import { githubService } from '@/app/services/github';

export const getDiscussionById = {
    description: 'Fetches a specific GitHub discussion by its ID',
    parameters: z.object({
        discussionId: z.string().describe('The GitHub GraphQL node ID of the discussion')
    }),
    execute: async ({ discussionId }: GetDiscussionByIdArgs) => {
        try {
            return await githubService.fetchDiscussionById(discussionId);
        } catch (error) {
            console.error('Error fetching GitHub discussion:', error);
            return `Error: Unable to fetch discussion with ID ${discussionId}. The discussion might not exist.`;
        }
    },
}; 