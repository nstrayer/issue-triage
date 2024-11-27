import { z } from 'zod';
import { SetSuggestedLabelsArgs } from '@/app/types/tools';

export const setSuggestedLabels = {
    description: 'Set your suggested labels for a specific issue after analyzing it. Call this to provide your label suggestions.',
    parameters: z.object({
        issueNumber: z.number().describe('The issue number you are suggesting labels for'),
        suggestedLabels: z.array(z.string()).describe('Array of label names that you suggest for this issue')
    }),
    execute: async ({ issueNumber, suggestedLabels }: SetSuggestedLabelsArgs) => {
        return {
            issueNumber,
            suggestedLabels,
            message: `Set ${suggestedLabels.length} suggested labels for issue #${issueNumber}`
        };
    },
}; 