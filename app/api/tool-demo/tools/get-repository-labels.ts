import { z } from 'zod';
import { githubService } from '@/app/services/github';

export const getRepositoryLabels = {
    description: 'Get all available labels in the repository',
    parameters: z.object({}),
    execute: async () => {
        try {
            return await githubService.fetchLabels();
        } catch (error) {
            console.error('Error fetching GitHub labels:', error);
            return 'Error fetching repository labels';
        }
    },
}; 