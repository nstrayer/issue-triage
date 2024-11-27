import { z } from 'zod';
import { getGitHubClient, REPO_OWNER, REPO_NAME } from '../github-client';

export const getRepositoryLabels = {
    description: 'Get all available labels in the repository',
    parameters: z.object({}),
    execute: async () => {
        try {
            const octokit = getGitHubClient();
            const allLabels = [];
            let page = 1;

            while (true) {
                const response = await octokit.issues.listLabelsForRepo({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    per_page: 100, // Maximum allowed per page
                    page
                });

                const labels = response.data;
                if (labels.length === 0) break;

                allLabels.push(...labels.map(label => ({
                    name: label.name,
                    color: label.color,
                    description: label.description,
                })));

                // Check if we've received less than the maximum per page
                // This means it's the last page
                if (labels.length < 100) break;

                page++;
            }

            return allLabels;
        } catch (error) {
            console.error('Error fetching GitHub labels:', error);
            return 'Error fetching repository labels';
        }
    },
}; 