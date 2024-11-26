import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface GitHubLabel {
    name: string;
    color: string;
    description: string | null;
}

interface GitHubIssue {
    number: number;
    title: string;
    body: string;
    state: string;
    created_at: string;
    labels: Array<{
        name: string;
        color: string;
    }>;
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: openai('gpt-4'),
            messages,
            experimental_toolCallStreaming: true,
            maxSteps: 5,
            tools: {
                getGithubIssue: {
                    description: 'Get a specific GitHub issue by its number',
                    parameters: z.object({
                        issueNumber: z.number().describe('The issue number to fetch')
                    }),
                    execute: async ({ issueNumber }: { issueNumber: number }) => {
                        try {
                            const octokit = new Octokit({
                                auth: process.env.GITHUB_TOKEN,
                            });

                            const response = await octokit.issues.get({
                                owner: 'posit-dev',
                                repo: 'positron',
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
                },
                getRepositoryLabels: {
                    description: 'Get all available labels in the repository',
                    parameters: z.object({}),
                    execute: async () => {
                        try {
                            const octokit = new Octokit({
                                auth: process.env.GITHUB_TOKEN,
                            });

                            const response = await octokit.issues.listLabelsForRepo({
                                owner: 'posit-dev',
                                repo: 'positron',
                            });

                            const labels = response.data.map(label => ({
                                name: label.name,
                                color: label.color,
                                description: label.description,
                            }));

                            return labels;
                        } catch (error) {
                            console.error('Error fetching GitHub labels:', error);
                            return 'Error fetching repository labels';
                        }
                    },
                },
                searchIssuesByLabels: {
                    description: 'Search for GitHub issues with specific labels. Returns most recent issues first.',
                    parameters: z.object({
                        labels: z.array(z.string()).describe('Array of label names to search for'),
                        limit: z.number().min(1).max(20).describe('Number of issues to return (max 20)')
                    }),
                    execute: async ({ labels, limit }: { labels: string[], limit: number }) => {
                        try {
                            const octokit = new Octokit({
                                auth: process.env.GITHUB_TOKEN,
                            });

                            // Convert array of labels to comma-separated string for GitHub API
                            const labelQuery = labels.join(',');

                            const response = await octokit.issues.listForRepo({
                                owner: 'posit-dev',
                                repo: 'positron',
                                labels: labelQuery,
                                state: 'all', // Get both open and closed issues
                                per_page: limit,
                                sort: 'created',
                                direction: 'desc'
                            });

                            const issues = response.data.map(issue => ({
                                number: issue.number,
                                title: issue.title,
                                body: issue.body,
                                state: issue.state,
                                created_at: issue.created_at,
                                labels: issue.labels.map(label => ({
                                    name: typeof label === 'string' ? label : label.name,
                                    color: typeof label === 'string' ? '' : label.color
                                }))
                            }));

                            return {
                                total: issues.length,
                                issues
                            };
                        } catch (error) {
                            console.error('Error searching issues by labels:', error);
                            return 'Error searching issues by labels';
                        }
                    },
                },
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in tool-demo API:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process tool demo request' }),
            { status: 500 }
        );
    }
} 