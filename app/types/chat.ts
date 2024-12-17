export interface Tool {
  name: string;
  description: string;
  execute: () => void;
}

export type SuggestedLabels  = Record<number, string[]>

export type ExpandedTools = Record<string, boolean>;
  
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  state?: string;
  result?: string | Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export interface GitHubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
}

export interface GitHubIssueLabel {
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    description: string | null;
    default: boolean;
}

export interface GitHubReactions {
    url: string;
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
}

export interface SubIssuesSummary {
    total: number;
    completed: number;
    percent_completed: number;
}


export interface GitHubLabel {
    name: string;
    color: string;
    description: string | null;
}

export interface GitHubData {
    total: number;
    issues: GithubIssue[];
    labels: GitHubLabel[];
}


/**
 * Configuration for the GitHub service
 */
export interface GitHubConfig {
    owner: string;
    repo: string;
    auth: string;
    timeoutMs?: number;
    projectName?: string; // Name of the GitHub project to track
}

export interface ProjectIssueStatus {
    issueNumber: number;
    title: string;
    status: string | null;
}

// Add these interfaces near the top of the file
export interface ProjectV2ItemNode {
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


export type GithubIssueResponse = {
  repository: {
    issues: {
      nodes: Array<{
        title: string;
        number: number;
        createdAt: string;
        url: string;
        body: string;
        state: string;
        pull_request?: unknown;
        author: {
          login: string;
          avatarUrl: string;
        };
        labels: {
          nodes: Array<{
            name: string;
            color: string;
          }>;
        };
        assignees: {
          nodes: Array<{
            login: string;
            avatarUrl: string;
          }>;
        };
        projectItems: {
          nodes: Array<{
            fieldValues: {
              nodes: Array<{
                text?: string;
                date?: string;
                name?: string;
                field: {
                  name: string;
                };
              }>;
            };
          }>;
        };
      }>;
    };
  };
};

export type GithubIssue = GithubIssueResponse['repository']['issues']['nodes'][number] & {
    labelsParsed: Array<string>;
};

export type GithubIssueFlat = Omit<GithubIssue, 'projectItems'>;

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
