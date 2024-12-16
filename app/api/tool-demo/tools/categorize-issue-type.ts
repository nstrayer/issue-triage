import { z } from 'zod';
import { CategorizeIssueTypeArgs } from '@/app/types/tools';

// Define issue type categories
const ISSUE_TYPES = {
    BUG: 'bug',
    FEATURE: 'feature',
    DOCUMENTATION: 'documentation',
    QUESTION: 'question',
    INFRASTRUCTURE: 'infrastructure',
} as const;

// Keywords that indicate different issue types
const TYPE_INDICATORS = {
    [ISSUE_TYPES.BUG]: [
        'error',
        'bug',
        'crash',
        'fix',
        'issue',
        'broken',
        'failure',
        'unexpected behavior',
        'regression',
    ],
    [ISSUE_TYPES.FEATURE]: [
        'feature',
        'enhancement',
        'request',
        'new',
        'add',
        'proposal',
        'improvement',
    ],
    [ISSUE_TYPES.DOCUMENTATION]: [
        'docs',
        'documentation',
        'typo',
        'readme',
        'wiki',
        'guide',
        'example',
    ],
    [ISSUE_TYPES.QUESTION]: [
        'question',
        'help',
        'support',
        'how to',
        'clarification',
        'explain',
    ],
    [ISSUE_TYPES.INFRASTRUCTURE]: [
        'build',
        'ci',
        'pipeline',
        'deploy',
        'infrastructure',
        'setup',
        'configuration',
    ],
};

export const categorizeIssueType = {
    description: 'Analyzes issue content to determine its type and appropriate categorization',
    parameters: z.object({
        issueNumber: z.number().describe('The GitHub issue to analyze'),
        issueContent: z.string().describe('The full content of the issue'),
        currentLabels: z.array(z.string()).describe('Any existing labels on the issue')
    }),
    execute: async ({ issueNumber, issueContent, currentLabels }: CategorizeIssueTypeArgs) => {
        try {
            const scores: Record<string, number> = {};
            const contentLower = issueContent.toLowerCase();

            // Calculate scores for each issue type based on keyword matches
            Object.entries(TYPE_INDICATORS).forEach(([type, keywords]) => {
                scores[type] = keywords.reduce((score, keyword) => {
                    const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
                    return score + matches;
                }, 0);
            });

            // Determine primary type based on highest score
            const primaryType = Object.entries(scores).reduce(
                (max, [type, score]) => (score > max.score ? { type, score } : max),
                { type: '', score: -1 }
            ).type;

            // Generate suggested labels based on content analysis
            const suggestedLabels = new Set<string>();
            
            // Add primary type as a label
            suggestedLabels.add(primaryType);

            // Detect technical areas
            if (contentLower.includes('python')) suggestedLabels.add('python');
            if (contentLower.includes('typescript') || contentLower.includes('javascript')) suggestedLabels.add('typescript');
            if (contentLower.includes('performance')) suggestedLabels.add('performance');
            if (contentLower.includes('security')) suggestedLabels.add('security');
            if (contentLower.includes('ui') || contentLower.includes('interface')) suggestedLabels.add('ui');
            if (contentLower.includes('api') || contentLower.includes('backend')) suggestedLabels.add('backend');

            // Calculate confidence score (0-1)
            const maxPossibleScore = Math.max(...Object.values(scores));
            const confidence = maxPossibleScore > 0 ? scores[primaryType] / maxPossibleScore : 0;

            // Generate reasoning
            const matchedKeywords = TYPE_INDICATORS[primaryType as keyof typeof TYPE_INDICATORS]
                .filter(keyword => contentLower.includes(keyword));
            
            const reasoning = `Categorized as ${primaryType} based on ${matchedKeywords.length} keyword matches: ${matchedKeywords.join(', ')}. ` +
                `Technical areas detected: ${Array.from(suggestedLabels).filter(label => label !== primaryType).join(', ')}`;

            return {
                primaryType,
                suggestedLabels: Array.from(suggestedLabels),
                confidence,
                reasoning,
            };
        } catch (error) {
            console.error('Error categorizing issue:', error);
            return {
                primaryType: 'unknown',
                suggestedLabels: [],
                confidence: 0,
                reasoning: `Failed to categorize: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
}; 