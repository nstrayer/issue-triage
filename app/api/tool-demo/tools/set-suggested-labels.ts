import { z } from 'zod';
import { SetSuggestedLabelsArgs } from '@/app/types/tools';
import { githubService } from '@/app/services/github';

export const setSuggestedLabels = {
    description: 'Set your suggested labels for a specific issue after analyzing it. Call this to provide your label suggestions.',
    parameters: z.object({
        issueNumber: z.number().describe('The issue number you are suggesting labels for'),
        suggestedLabels: z.array(z.string()).describe('Array of label names that you suggest for this issue')
    }),
    execute: async ({ issueNumber, suggestedLabels }: SetSuggestedLabelsArgs) => {
        try {
            await githubService.applyLabels(issueNumber, suggestedLabels);
            return {
                success: true,
                issueNumber,
                suggestedLabels,
                message: `Successfully applied ${suggestedLabels.length} labels to issue #${issueNumber}: ${suggestedLabels.join(', ')}`
            };
        } catch (error) {
            console.error('Error applying suggested labels:', error);
            return {
                success: false,
                issueNumber,
                suggestedLabels,
                message: `Failed to apply labels: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    },
}; 