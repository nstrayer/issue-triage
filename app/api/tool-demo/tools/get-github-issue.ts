import { z } from 'zod';
import { GetGithubIssueArgs } from '@/app/types/tools';
import { getGitHubClient, REPO_OWNER, REPO_NAME } from '../github-client';

export const getGithubIssue = {
    description: 'Get a specific GitHub issue by its number',
    parameters: z.object({
        issueNumber: z.number().describe('The issue number to fetch')
    }),
    execute: async ({ issueNumber }: GetGithubIssueArgs) => {
        try {
            const octokit = getGitHubClient();

            const response = await octokit.issues.get({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                issue_number: issueNumber
            });

            const issue = response.data;
            return {
                number: issue.number,
                title: issue.title,
                body: issue.body,
                state: issue.state,
                created_at: issue.created_at,
                labels: issue.labels.map(label => ({
                    name: typeof label === 'string' ? label : label.name,
                    color: typeof label === 'string' ? '' : label.color
                }))
            };
        } catch (error) {
            console.error('Error fetching GitHub issue:', error);
            return `Error: Unable to fetch issue #${issueNumber}. The issue might not exist.`;
        }
    },
}; 