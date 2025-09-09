/**
 * Represents a tool that can be invoked in the chat application.
 */
export interface Tool {
  /**
   * The name of the tool.
   */
  name: string;

  /**
   * A brief description of the tool's functionality.
   */
  description: string;

  /**
   * Executes the tool's action.
   */
  execute: () => void;
}

/**
 * A mapping of issue numbers to arrays of suggested label names.
 */
export type SuggestedLabels = Record<number, string[]>;

/**
 * A mapping of tool call IDs to a boolean indicating if the tool is expanded in the UI.
 */
export type ExpandedTools = Record<string, boolean>;

/**
 * Represents a tool invocation within a chat message.
 */
export interface ToolInvocation {
  /**
   * A unique identifier for the tool call.
   */
  toolCallId: string;

  /**
   * The name of the tool that was invoked.
   */
  toolName: string;

  /**
   * Optional arguments provided to the tool.
   */
  args?: Record<string, unknown>;

  /**
   * The current state of the tool invocation.
   */
  state?: string;

  /**
   * The result returned by the tool.
   */
  result?: string | Record<string, unknown>;
}

/**
 * Represents a chat message in the application.
 */
export interface ChatMessage {
  /**
   * A unique identifier for the message.
   */
  id: string;

  /**
   * The role of the sender.
   */
  role: 'user' | 'assistant' | 'system' | 'data';

  /**
   * The content of the message.
   */
  content: string;

  /**
   * Optional array of tool invocations associated with the message.
   */
  toolInvocations?: ToolInvocation[];
}

/**
 * Represents a GitHub user.
 */
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

/**
 * Represents a label on a GitHub issue.
 */
export interface GitHubIssueLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  description: string | null;
  default: boolean;
}

/**
 * Represents reactions on a GitHub issue or comment.
 */
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

/**
 * Summary of sub-issues within a larger issue.
 */
export interface SubIssuesSummary {
  total: number;
  completed: number;
  percent_completed: number;
}

/**
 * Simplified representation of a GitHub label.
 */
export interface GitHubLabel {
  /**
   * The name of the label.
   */
  name: string;

  /**
   * The color of the label in hex format.
   */
  color: string;

  /**
   * The description of the label.
   */
  description: string | null;
}

/**
 * Represents GitHub data including issues and labels.
 */
export interface GitHubData {
  /**
   * The total number of issues.
   */
  total: number;

  /**
   * An array of GitHub issues.
   */
  issues: GithubIssue[];

  /**
   * An array of GitHub labels.
   */
  labels: GitHubLabel[];
}

/**
 * Configuration settings for the GitHub service.
 */
export interface GitHubConfig {
  /**
   * The GitHub repository owner.
   */
  owner: string;

  /**
   * The GitHub repository name.
   */
  repo: string;

  /**
   * The authentication token for GitHub API access.
   */
  auth: string;

  /**
   * Optional timeout setting in milliseconds.
   */
  timeoutMs?: number;

  /**
   * The name of the GitHub project to track.
   */
  projectName?: string;
}

/**
 * Response type for GitHub GraphQL queries fetching issues.
 */
export interface GithubIssueResponse {
  repository: {
    issues: {
      nodes: GithubIssueNode[];
    };
  };
}

/**
 * Represents a node (issue) within the GitHub GraphQL response.
 */
export interface GithubIssueNode {
  title: string;
  number: number;
  createdAt: string;
  url: string;
  body: string;
  state: string;
  pull_request?: unknown;
  author: GithubUser;
  authorAssociation: AuthorAssociation;
  comments: {
    totalCount: number;
    nodes: GithubDiscussionComment[];
  };
  labels: {
    nodes: Array<{
      name: string;
      color: string;
    }>;
  };
  assignees: {
    nodes: Array<GithubUser>;
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
}

/**
 * Represents a GitHub issue with parsed label names.
 */
export type GithubIssue = GithubIssueNode & {
  /**
   * An array of label names extracted from the issue.
   */
  labelsParsed: string[];
};

/**
 * Represents a flattened GitHub issue without project items.
 */
export type GithubIssueFlat = Omit<GithubIssue, 'projectItems'>;

/**
 * Represents a GitHub discussion comment
 */
export interface GithubDiscussionComment {
  body: string;
  author: GithubUser;
  authorAssociation: AuthorAssociation;
  createdAt: string;
}

/**
 * Represents the possible author associations with a repository.
 */
type AuthorAssociation = 
  | 'MEMBER'
  | 'OWNER'
  | 'MANNEQUIN'
  | 'COLLABORATOR'
  | 'CONTRIBUTOR'
  | 'FIRST_TIME_CONTRIBUTOR'
  | 'FIRST_TIMER'
  | 'NONE';

/**
 * Represents a GitHub user.
 */
type GithubUser = {
  avatarUrl: string;
  login: string;
  url: string;
};

/**
 * Represents a GitHub discussion.
 */
export type GithubDiscussion = {
  id: string;
  author: GithubUser;
  authorAssociation: AuthorAssociation;
  createdAt: string;
  closed: boolean;
  title: string;
  body: string;
  bodyText: string;
  isAnswered: boolean;
  url: string;
  comments: {
    totalCount: number;
    nodes: GithubDiscussionComment[];
  };
};

/**
 * Represents the response structure for GitHub discussions query.
 */
export type GithubDiscussionResponse = {
  repository: {
    discussions: {
      totalCount: number;
      nodes: GithubDiscussion[];
    };
  };
};

export type GithubDiscussionByIdResponse = {
  node: GithubDiscussion;
};
