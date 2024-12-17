import { Octokit } from '@octokit/rest';
import { GitHubData, GithubIssue, GitHubLabel, GitHubUser } from '../types/chat';

/**
 * Configuration for the GitHub service
 */
interface GitHubConfig {
    owner: string;
    repo: string;
    auth: string;
    timeoutMs?: number;
    projectName?: string; // Name of the GitHub project to track
}

interface ProjectIssueStatus {
    issueNumber: number;
    title: string;
    status: string | null;
}

// Add these interfaces near the top of the file
interface ProjectV2ItemNode {
    content?: {
        number: number;
        title: string;
    };
    fieldValues: {
        nodes: Array<{
            name?: string;
            field?: {
                name: string;
            };
        }>;
    };
}


type GithubIssueResponse = {
    repository: {
      issues: {
        nodes: Array<{
          title: string;
          number: number;
          createdAt: string;
          projectItems: {
            nodes: Array<{
              fieldValues: {
                nodes: Array<ProjectFieldValue>;
              };
            }>;
          };
        }>;
      };
    };
  };
  
  // Union type for different field values
  type ProjectFieldValue = 
    | ProjectTextFieldValue 
    | ProjectDateFieldValue 
    | ProjectSingleSelectFieldValue;
  
  type BaseFieldValue = {
    field: {
      name: string;
    };
  };
  
  type ProjectTextFieldValue = BaseFieldValue & {
    text: string;
  };
  
  type ProjectDateFieldValue = BaseFieldValue & {
    date: string;
  };
  
  type ProjectSingleSelectFieldValue = {
    name: string;
    field: {
      name: string;
    };
  };
  
  // Helper type to get a single issue from the response
  type Issue = GithubIssueResponse['repository']['issues']['nodes'][number];
  
  // Helper type to get field values for an issue
  type IssueFieldValues = Issue['projectItems']['nodes'][number]['fieldValues']['nodes'];

interface ProjectV2Response {
    node: {
        items: {
            nodes: Array<{
                id: string;
                content?: {
                    number: number;
                    title: string;
                    state: string;
                };
                fieldValues: {
                    nodes: Array<{
                        name?: string;
                        field?: {
                            name: string;
                        };
                    }>;
                };
            }>;
            pageInfo: {
                hasNextPage: boolean;
                endCursor: string;
            };
        };
    };
}

/**
 * Service class for handling GitHub API operations
 */
export class GitHubService {
    private octokit: Octokit;
    private owner: string;
    private repo: string;
    private projectName: string;

    constructor(config: GitHubConfig) {
        this.octokit = new Octokit({
            auth: config.auth,
            timeoutMs: config.timeoutMs || 10000,
        });
        this.owner = config.owner;
        this.repo = config.repo;
        this.projectName = config.projectName || 'Positron Backlog';
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
    } = {}): Promise<GithubIssue[]> {
        const {
            state = 'open',
            labels,
            since = this.getDateNDaysAgo(7),
            devPageLimit = 10
        } = options;

        let allIssues: GithubIssue[] = [];
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
    async getIssue(issueNumber: number): Promise<GithubIssue> {
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
    private normalizeIssue(issue: any): GithubIssue {
        return {
            url: issue.url,
            labels_url: issue.labels_url,
            comments_url: issue.comments_url,
            events_url: issue.events_url,
            html_url: issue.html_url,
            id: issue.id,
            node_id: issue.node_id,
            number: issue.number,
            title: issue.title,
            user: {
                login: issue.user.login,
                id: issue.user.id,
                node_id: issue.user.node_id,
                avatar_url: issue.user.avatar_url,
                gravatar_id: issue.user.gravatar_id || '',
                url: issue.user.url,
                html_url: issue.user.html_url,
                type: issue.user.type,
                site_admin: issue.user.site_admin
            },
            labels: issue.labels,
            labelsCleaned: issue.labels.map((label: any) => ({
                name: typeof label === 'string' ? label : (label.name || ''),
                color: typeof label === 'string' ? 'default' : (label.color || 'default'),
            })),
            state: issue.state,
            locked: issue.locked,
            assignee: issue.assignee ? {
                login: issue.assignee.login,
                id: issue.assignee.id,
                node_id: issue.assignee.node_id,
                avatar_url: issue.assignee.avatar_url,
                gravatar_id: issue.assignee.gravatar_id || '',
                url: issue.assignee.url,
                html_url: issue.assignee.html_url,
                type: issue.assignee.type,
                site_admin: issue.assignee.site_admin
            } : null,
            assignees: (issue.assignees || []).map((assignee: any) => ({
                login: assignee.login,
                id: assignee.id,
                node_id: assignee.node_id,
                avatar_url: assignee.avatar_url,
                gravatar_id: assignee.gravatar_id || '',
                url: assignee.url,
                html_url: assignee.html_url,
                type: assignee.type,
                site_admin: assignee.site_admin
            })),
            milestone: issue.milestone,
            comments: issue.comments,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            closed_at: issue.closed_at,
            author_association: issue.author_association,
            body: issue.body,
            reactions: {
                url: issue.reactions.url,
                total_count: issue.reactions.total_count,
                '+1': issue.reactions['+1'],
                '-1': issue.reactions['-1'],
                laugh: issue.reactions.laugh,
                hooray: issue.reactions.hooray,
                confused: issue.reactions.confused,
                heart: issue.reactions.heart,
                rocket: issue.reactions.rocket,
                eyes: issue.reactions.eyes
            },
            timeline_url: issue.timeline_url,
            performed_via_github_app: issue.performed_via_github_app,
            state_reason: issue.state_reason,
            sub_issues_summary: {
                total: issue.sub_issues_summary?.total || 0,
                completed: issue.sub_issues_summary?.completed || 0,
                percent_completed: issue.sub_issues_summary?.percent_completed || 0
            },
            active_lock_reason: issue.active_lock_reason,
        };
    }

    /**
     * Get the project ID for the configured project
     * @returns Promise<string> The node ID of the project
     */
    private async getProjectId(): Promise<string> {
        interface ProjectResponse {
            organization: {
                projectsV2: {
                    nodes: Array<{
                        id: string;
                        title: string;
                    }>;
                };
            };
        }

        const response = await this.octokit.graphql<ProjectResponse>(`
            query($org: String!, $projectName: String!) {
                organization(login: $org) {
                    projectsV2(first: 20, query: $projectName) {
                        nodes {
                            id
                            title
                        }
                    }
                }
            }
        `, {
            org: this.owner,
            projectName: this.projectName,
        });

        const project = response.organization.projectsV2.nodes.find(
            (p) => p.title === this.projectName
        );

        if (!project) {
            throw new Error(`Project "${this.projectName}" not found`);
        }

        return project.id;
    }

    /**
     * Get the status field ID for the project
     * @param projectId The node ID of the project
     * @returns Promise<string> The ID of the status field
     */
    private async getStatusFieldId(projectId: string): Promise<string> {
        interface StatusFieldResponse {
            node: {
                fields: {
                    nodes: Array<{
                        id: string;
                        name: string;
                    }>;
                };
            };
        }

        const response = await this.octokit.graphql<StatusFieldResponse>(`
            query($projectId: ID!) {
                node(id: $projectId) {
                    ... on ProjectV2 {
                        fields(first: 20) {
                            nodes {
                                ... on ProjectV2SingleSelectField {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            }
        `, {
            projectId,
        });

        const statusField = response.node.fields.nodes.find(
            (field) => field.name === 'Status'
        );

        if (!statusField) {
            throw new Error('Status field not found in project');
        }

        return statusField.id;
    }

    /**
     * Fetch all issues that have no status set in the project
     * @returns Promise<GithubIssue[]> Array of issues without status
     */
    async fetchIssuesWithoutStatus(): Promise<GithubIssue[]> {
        try {
            const projectId = await this.getProjectId();

            const issuesAndProjectStatusQuery = `{
  repository(owner: "posit-dev", name: "positron") {
    issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        title
        number
        createdAt
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

            // Filter issues to only include those that have a Status field but no value
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
            });

            // Convert the filtered issues to GithubIssue format
            return issuesWithoutStatus.map(issue => ({
                title: issue.title,
                number: issue.number,
                created_at: issue.createdAt,
                // Add other required GithubIssue fields with default values
                url: '',
                labels_url: '',
                comments_url: '',
                events_url: '',
                html_url: '',
                id: 0,
                node_id: '',
                user: {
                    login: '',
                    id: 0,
                    node_id: '',
                    avatar_url: '',
                    gravatar_id: '',
                    url: '',
                    html_url: '',
                    type: '',
                    site_admin: false
                },
                labels: [],
                labelsCleaned: [],
                state: 'open',
                locked: false,
                assignee: null,
                assignees: [],
                milestone: null,
                comments: 0,
                updated_at: issue.createdAt,
                closed_at: null,
                author_association: '',
                body: '',
                reactions: {
                    url: '',
                    total_count: 0,
                    '+1': 0,
                    '-1': 0,
                    laugh: 0,
                    hooray: 0,
                    confused: 0,
                    heart: 0,
                    rocket: 0,
                    eyes: 0
                },
                timeline_url: '',
                performed_via_github_app: null,
                state_reason: null,
                sub_issues_summary: {
                    total: 0,
                    completed: 0,
                    percent_completed: 0
                },
                active_lock_reason: null
            }));
            
        } catch (error) {
            console.error('Error fetching issues from Intake view:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to fetch issues from Intake view: ${error.message}`);
            }
            throw new Error('Failed to fetch issues from Intake view');
        }
    }

    /**
     * Fetches issues from a GitHub Project with their status
     * @returns Array of issues with their project status
     */
    async getProjectIssuesWithStatus(): Promise<Array<ProjectIssueStatus>> {
        const query = `
            query($org: String!, $projectNumber: Int!) {
                organization(login: $org) {
                    projectV2(number: $projectNumber) {
                        items(first: 20) {
                            nodes {
                                content {
                                    ... on Issue {
                                        number
                                        title
                                    }
                                }
                                fieldValues(first: 8) {
                                    nodes {
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
        `;

        try {
            const response = await this.octokit.graphql<ProjectV2Response>(query, {
                org: 'your-org',
                projectNumber: 1
            });

            return response.organization.projectV2.items.nodes
                .filter((item): item is ProjectV2ItemNode => item.content?.number != null && item.content?.title != null)
                .map((item) => ({
                    issueNumber: item.content!.number,
                    title: item.content!.title,
                    status: item.fieldValues.nodes
                        .find((field) => field?.field?.name === 'Status')
                        ?.name || null
                }));
        } catch (error) {
            console.error('Error fetching project issues:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to fetch project issues: ${error.message}`);
            }
            throw new Error('Failed to fetch project issues');
        }
    }


    /**
     * Fetches issues from a GitHub Project with their status
     * @returns Array of issues with their project status
     */
    async getProjectIssuesStatus(projectNumber: number): Promise<ProjectIssueStatus[]> {
        const query = `
            query($org: String!, $projectNumber: Int!) {
                organization(login: $org) {
                    projectV2(number: $projectNumber) {
                        items(first: 20) {
                            nodes {
                                content {
                                    ... on Issue {
                                        number
                                        title
                                    }
                                }
                                fieldValues(first: 8) {
                                    nodes {
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
        `;

        try {
            const response = await this.octokit.graphql<ProjectV2Response>(query, {
                org: this.owner,
                projectNumber
            });

            return response.organization.projectV2.items.nodes
                .filter((item): item is ProjectV2ItemNode => item.content?.number != null && item.content?.title != null)
                .map((item) => ({
                    issueNumber: item.content!.number,
                    title: item.content!.title,
                    status: item.fieldValues.nodes
                        .find((field) => field?.field?.name === 'Status')
                        ?.name || null
                }));
        } catch (error) {
            console.error('Error fetching project issues:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to fetch project issues: ${error.message}`);
            }
            throw new Error('Failed to fetch project issues');
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