import { z } from 'zod';
import { SetIssueStatusArgs } from '@/app/types/tools';
import { getGitHubClient } from '../github-client';

const VALID_STATUSES = [
    '',
    'Triage',
    'Backlog',
    'Up Next',
    'In Progress',
    'PR Ready',
    'Ready for Verification',
    'In Verification',
    'Done'
] as const;

type ValidStatus = typeof VALID_STATUSES[number];

export const setIssueStatus = {
    description: 'Updates the status field of a GitHub issue based on workflow rules',
    parameters: z.object({
        issueNumber: z.number().describe('The GitHub issue number to update'),
        currentStatus: z.string().nullable().describe('The current status value if any'),
        suggestedStatus: z.string().describe('The proposed new status value'),
        reason: z.string().describe('Justification for the status change')
    }),
    execute: async ({ issueNumber, currentStatus, suggestedStatus, reason }: SetIssueStatusArgs) => {
        try {
            const octokit = getGitHubClient();

            // Validate suggested status
            if (!VALID_STATUSES.includes(suggestedStatus as ValidStatus)) {
                throw new Error(`Invalid status: ${suggestedStatus}. Must be one of: ${VALID_STATUSES.join(', ')}`);
            }

            // Get current issue state to validate transitions
            const { data: issue } = await octokit.rest.issues.get({
                owner: process.env.GITHUB_REPOSITORY_OWNER!,
                repo: process.env.GITHUB_REPOSITORY_NAME!,
                issue_number: issueNumber,
            });

            // Validate status transitions
            if (suggestedStatus === 'Done' && issue.state_reason !== 'completed') {
                throw new Error('Cannot set status to Done for non-completed issues');
            }

            // Update the status using a custom field or label
            await octokit.rest.issues.update({
                owner: process.env.GITHUB_REPOSITORY_OWNER!,
                repo: process.env.GITHUB_REPOSITORY_NAME!,
                issue_number: issueNumber,
                body: `${issue.body}\n\nStatus: ${suggestedStatus}\nReason: ${reason}`,
            });

            return {
                success: true,
                previousStatus: currentStatus || '',
                newStatus: suggestedStatus,
                message: `Successfully updated issue #${issueNumber} status to "${suggestedStatus}". Reason: ${reason}`,
            };
        } catch (error) {
            console.error('Error updating issue status:', error);
            return {
                success: false,
                previousStatus: currentStatus || '',
                newStatus: currentStatus || '',
                message: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
}; 