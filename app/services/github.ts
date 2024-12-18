import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { GitHubConfig, GithubDiscussion, GithubDiscussionByIdResponse, GithubDiscussionResponse, GithubIssue, GithubIssueResponse, GitHubLabel } from '../types/chat';

/**
 * Represents a GitHub issue as returned by Octokit.
 */
type OctokitIssue = RestEndpointMethodTypes['issues']['listForRepo']['response']['data'][number];

/**
 * Service class for handling GitHub API operations.
 */
export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  /**
   * Initializes the GitHubService with the provided configuration.
   * @param config Configuration settings for GitHub access.
   */
  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({
      auth: config.auth,
      request: {
        timeout: config.timeoutMs || 10000,
      },
    });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  /**
   * Fetches issues from the repository with optional filtering and pagination.
   * @param options Options for fetching issues.
   * @returns A promise resolving to an array of GitHub issues.
   */
  async fetchIssues(options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string[];
    since?: string;
    devPageLimit?: number;
  } = {}): Promise<OctokitIssue[]> {
    const {
      state = 'open',
      labels,
      since,
      devPageLimit = 10,
    } = options;

    const allIssues: OctokitIssue[] = [];
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
      allIssues.push(...issues);

      if (issues.length < 100) {
        break;
      }

      page++;
    }

    // Exclude pull requests from the issues list
    return allIssues.filter((issue) => !issue.pull_request);
  }

  /**
   * Fetches all labels from the repository.
   * @returns A promise resolving to an array of GitHub labels.
   */
  async fetchLabels(): Promise<GitHubLabel[]> {
    const response = await this.octokit.rest.issues.listLabelsForRepo({
      owner: this.owner,
      repo: this.repo,
    });

    return response.data.map((label) => ({
      name: label.name,
      color: label.color,
      description: label.description,
    }));
  }

  /**
   * Applies labels to a specific issue.
   * @param issueNumber The number of the issue to label.
   * @param labels An array of labels to apply.
   * @returns A promise that resolves when labels are applied.
   */
  async applyLabels(issueNumber: number, labels: string[]): Promise<void> {
    await this.octokit.rest.issues.setLabels({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      labels,
    });
  }

  /**
   * Retrieves a single issue by its number.
   * @param issueNumber The number of the issue to retrieve.
   * @returns A promise resolving to the fetched issue.
   */
  async getIssue(issueNumber: number): Promise<OctokitIssue> {
    const response = await this.octokit.rest.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });

    return response.data;
  }

  /**
   * Fetches issues that have no status set in the project.
   * @returns A promise resolving to an array of issues without status.
   */
  async fetchIssuesWithoutStatus(): Promise<GithubIssue[]> {
    try {
      const query = `
        {
          repository(owner: "${this.owner}", name: "${this.repo}") {
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

      const response = await this.octokit.graphql<GithubIssueResponse>(query);

      // Filter out issues that already have a "Status" field set
      const issuesWithoutStatus = response.repository.issues.nodes.filter((issue) => {
        const projectItem = issue.projectItems.nodes[0];
        if (!projectItem) return false;

        const hasStatusField = projectItem.fieldValues.nodes.some(
          (fieldValue) => fieldValue.field?.name === 'Status'
        );

        return !hasStatusField;
      });

      // Parse labels for each issue
      return issuesWithoutStatus.map((issue) => ({
        ...issue,
        labelsParsed: issue.labels.nodes.map((label) => label.name),
      }));
    } catch (error) {
      console.error('Error fetching issues without status:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch issues from Intake view: ${error.message}`);
      }
      throw new Error('Failed to fetch issues from Intake view due to an unknown error.');
    }
  }

  /**
   * Fetches discussions from the repository.
   * @param limit The maximum number of discussions to fetch (default: 10)
   * @returns A promise resolving to an array of GitHub discussions and their total count
   */
  async fetchDiscussions(limit: number = 10): Promise<{ discussions: GithubDiscussion[]; totalCount: number }> {
    try {
      const query = `
        {
          repository(owner: "${this.owner}", name: "${this.repo}") {
            discussions(
              first: ${limit}
              orderBy: {field: CREATED_AT, direction: DESC}
            ) {
              nodes {
                id
                url
                author {
                  avatarUrl
                  login
                  url
                }
                authorAssociation
                createdAt
                closed
                title
                body
                bodyText
                isAnswered
                comments(first: 10) {
                  totalCount
                  nodes {
                    author {
                      avatarUrl
                      login
                      url
                    }
                    authorAssociation
                    createdAt
                    body
                  }
                } 
              }
            }
          }
        }`;

      const response = await this.octokit.graphql<GithubDiscussionResponse>(query);

      return {
        discussions: response.repository.discussions.nodes,
        totalCount: response.repository.discussions.totalCount
      };
    } catch (error) {
      console.error('Error fetching discussions:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch discussions: ${error.message}`);
      }
      throw new Error('Failed to fetch discussions due to an unknown error.');
    }
  }

  /**
   * Fetches a specific GitHub discussion by its ID.
   * @param discussionId The GitHub GraphQL node ID of the discussion
   * @returns A promise resolving to the GitHub discussion
   * @throws Error if the discussion cannot be fetched
   */
  async fetchDiscussionById(discussionId: string): Promise<GithubDiscussion> {
    try {
      const query = `
        {
          node(id: "${discussionId}") {
            ... on Discussion {
              id
              url
              title
              body
              bodyText
              author {
                avatarUrl
                login
                url
              }
              authorAssociation
              createdAt
              updatedAt
              closed
              isAnswered
              category {
                name
              }
              comments(first: 10) {
                totalCount
                nodes {
                  id
                  author {
                    avatarUrl
                    login
                    url
                  }
                  authorAssociation
                  body
                  createdAt
                  updatedAt
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        }`;

      const response = await this.octokit.graphql<GithubDiscussionByIdResponse>(query);

      if (!response.node) {
        throw new Error(`Discussion with ID ${discussionId} not found`);
      }

      return response.node;
    } catch (error) {
      console.error('Error fetching discussion by ID:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch discussion: ${error.message}`);
      }
      throw new Error('Failed to fetch discussion due to an unknown error.');
    }
  }
}

/**
 * A singleton instance of GitHubService with default configuration.
 */
export const githubService = new GitHubService({
  owner: process.env.GITHUB_REPOSITORY_OWNER || 'posit-dev',
  repo: process.env.GITHUB_REPOSITORY_NAME || 'positron',
  auth: process.env.GITHUB_TOKEN || '',
  projectName: 'Positron Backlog',
}); 