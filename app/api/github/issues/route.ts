import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

/**
 * GitHub API response type for repository issues
 */
interface GitHubIssue {
    number: number;
    title: string;
    state: string;
    created_at: string;
    body: string;
    labels: Array<{
        name: string;
        color: string;
    }>;
}

// Set to a number to limit pages during development, or false for no limit
const DEV_PAGE_LIMIT = 3;

// Timeout for GitHub API calls (in milliseconds)
const API_TIMEOUT = 10000;

/**
 * Get ISO string for date one week ago
 */
function getOneWeekAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString();
}

/**
 * Handles GET requests to fetch GitHub issues
 * @returns Response containing issue count and basic issue data
 */
export async function GET() {
    try {
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
            timeoutMs: API_TIMEOUT,
        });

        let allIssues: GitHubIssue[] = [];
        let page = 1;

        while (true) {
            if (DEV_PAGE_LIMIT && page > DEV_PAGE_LIMIT) {
                console.log('Hit development page limit, stopping at page', page);
                break;
            }

            const response = await octokit.issues.listForRepo({
                owner: 'posit-dev',
                repo: 'positron',
                state: 'open',
                per_page: 100,
                page,
                since: getOneWeekAgo(),
            });

            const issues = response.data.map(issue => ({
                number: issue.number,
                title: issue.title,
                state: issue.state,
                created_at: issue.created_at,
                body: issue.body || '',
                labels: issue.labels.map(label => ({
                    name: label.name,
                    color: label.color,
                })),
            }));

            allIssues = [...allIssues, ...issues];

            if (issues.length < 100) {
                break;
            }

            page++;
        }

        return NextResponse.json({
            total: allIssues.length,
            issues: allIssues,
        });
    } catch (error) {
        console.error('Error fetching GitHub issues:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub issues' },
            { status: 500 }
        );
    }
} 