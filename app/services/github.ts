import { Octokit } from '@octokit/rest';

/**
 * Type definition for GitHub issues data
 */
export interface GitHubData {
    total: number;
    issues: GitHubIssue[];
    labels: GitHubLabel[];
}

export interface GitHubIssue {
    number: number;
    title: string;
    state: string;
    created_at: string;
    body: string | null;
    labels: Array<{
        name: string;
        color: string;
    }>;
    pull_request?: unknown;
}

export interface GitHubLabel {
    name: string;
    color: string;
    description: string | null;
}

/**
 * Configuration for the GitHub service
 */
interface GitHubConfig {
    owner: string;
    repo: string;
    auth: string;
    timeoutMs?: number;
}

/**
 * Service class for handling GitHub API operations
 */
export class GitHubService {
    private octokit: Octokit;
    private owner: string;
    private repo: string;

    constructor(config: GitHubConfig) {
        this.octokit = new Octokit({
            auth: config.auth,
            timeoutMs: config.timeoutMs || 10000,
        });
        this.owner = config.owner;
        this.repo = config.repo;
    }

    /**
     * Get ISO string for date N days ago
     */
    private getDateNDaysAgo(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    }

    /**
     * Fetch all issues from the repository with pagination
     * @param options Optional parameters for fetching issues
     * @returns Array of GitHub issues
     */
    async fetchIssues(options: {
        state?: 'open' | 'closed' | 'all';
        labels?: string[];
        since?: string;
        devPageLimit?: number;
    } = {}): Promise<GitHubIssue[]> {
        const {
            state = 'open',
            labels,
            since = this.getDateNDaysAgo(7),
            devPageLimit = 10
        } = options;

        let allIssues: GitHubIssue[] = [];
        let page = 1;

        while (true) {
            if (devPageLimit && page > devPageLimit) {
                console.log('Hit development page limit, stopping at page', page);
                break;
            }

            const response = await this.octokit.rest.issues.listForRepo({
                owner: this.owner,
                repo: this.repo,
                state,
                labels: labels?.join(','),
                per_page: 100,
                page,
                since,
            });

            const issues = response.data.map(this.normalizeIssue);
            allIssues = [...allIssues, ...issues];

            if (issues.length < 100) {
                break;
            }

            page++;
        }

        return allIssues.filter(issue => !issue.pull_request);
    }

    /**
     * Fetch all labels from the repository
     * @returns Array of GitHub labels
     */
    async fetchLabels(): Promise<GitHubLabel[]> {
        const response = await this.octokit.issues.listLabelsForRepo({
            owner: this.owner,
            repo: this.repo,
        });

        return response.data.map(label => ({
            name: label.name,
            color: label.color,
            description: label.description,
        }));
    }

    /**
     * Apply labels to an issue
     * @param issueNumber The issue number to apply labels to
     * @param labels Array of label names to apply
     */
    async applyLabels(issueNumber: number, labels: string[]): Promise<void> {
        await this.octokit.issues.setLabels({
            owner: this.owner,
            repo: this.repo,
            issue_number: issueNumber,
            labels,
        });
    }

    /**
     * Get a single issue by number
     * @param issueNumber The issue number to fetch
     */
    async getIssue(issueNumber: number): Promise<GitHubIssue> {
        const response = await this.octokit.issues.get({
            owner: this.owner,
            repo: this.repo,
            issue_number: issueNumber,
        });

        return this.normalizeIssue(response.data);
    }

    /**
     * Normalize GitHub API response to our internal issue type
     */
    private normalizeIssue(issue: any): GitHubIssue {
        return {
            number: issue.number,
            title: issue.title,
            state: issue.state,
            created_at: issue.created_at,
            body: issue.body ?? null,
            labels: issue.labels.map((label: any) => ({
                name: typeof label === 'string' ? label : (label.name || ''),
                color: typeof label === 'string' ? 'default' : (label.color || 'default'),
            })),
            pull_request: issue.pull_request,
        };
    }
}

// Export a singleton instance with default configuration
export const githubService = new GitHubService({
    owner: process.env.GITHUB_REPOSITORY_OWNER || 'posit-dev',
    repo: process.env.GITHUB_REPOSITORY_NAME || 'positron',
    auth: process.env.GITHUB_TOKEN || '',
}); 