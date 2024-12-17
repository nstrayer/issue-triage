import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { GitHubConfig, GithubIssue, GithubIssueFlat, GithubIssueResponse, GitHubLabel } from '../types/chat';


type OctocatIssue = RestEndpointMethodTypes["issues"]["listForRepo"]["response"]['data'][number]

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
    } = {}): Promise<OctocatIssue[]> {
        const {
            state = 'open',
            labels,
            since = this.getDateNDaysAgo(7),
            devPageLimit = 10
        } = options;

        let allIssues: OctocatIssue[] = [];
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

            const issues = response.data;
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
    async getIssue(issueNumber: number): Promise<OctocatIssue> {
        const response = await this.octokit.issues.get({
            owner: this.owner,
            repo: this.repo,
            issue_number: issueNumber,
        });

        const issue = response.data;
        // TODO: Remove this once we have a proper type for the issue
        return issue;
    }
    /**
     * Fetch all issues that have no status set in the project
     * @returns Promise<GithubIssue[]> Array of issues without status
     */
    async fetchIssuesWithoutStatus(): Promise<GithubIssue[]> {
        try {

            const issuesAndProjectStatusQuery = `{
  repository(owner: "posit-dev", name: "positron") {
    issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        title
        number
        createdAt
        url
        body
        state
        author {
          login
          avatarUrl
        }
        labels(first: 10) {
          nodes {
            name
            color
          }
        }
        assignees(first: 5) {
          nodes {
            login
            avatarUrl
          }
        }
        projectItems(first: 100) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2Field {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ... on ProjectV2Field {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

            const response = await this.octokit.graphql<GithubIssueResponse>(issuesAndProjectStatusQuery);

            // Filter issues to only include those that have no Status field
            const issuesWithoutStatus = response.repository.issues.nodes.filter(issue => {
                // Check if the issue has any project items
                if (!issue.projectItems.nodes.length) return false;

                // Look through all field values for this issue
                const projectItem = issue.projectItems.nodes[0];
                const fieldValues = projectItem.fieldValues.nodes;

                // Find if there's a Status field
                const statusField = fieldValues.find(fieldValue => 
                    fieldValue.field?.name === 'Status'
                );

                return !statusField;
            }) as Omit<GithubIssue, 'labelsParsed'>[];

            return issuesWithoutStatus.map(issue => {
                const labelsParsed = issue.labels.nodes.map(label => label.name);
                return {
                    ...issue,
                    labelsParsed
                }
            })
        } catch (error) {
            console.error('Error fetching issues from Intake view:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to fetch issues from Intake view: ${error.message}`);
            }
            throw new Error('Failed to fetch issues from Intake view');
        }
    }



}

// Export a singleton instance with default configuration
export const githubService = new GitHubService({
    owner: process.env.GITHUB_REPOSITORY_OWNER || 'posit-dev',
    repo: process.env.GITHUB_REPOSITORY_NAME || 'positron',
    auth: process.env.GITHUB_TOKEN || '',
    projectName: 'Positron Backlog',
}); 