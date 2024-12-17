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

export interface GithubIssue {
    url: string;
    labels_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    labels: GitHubIssueLabel[];
    labelsCleaned: Array<{
        name: string;
        color: string;
    }>;
    state: string;
    locked: boolean;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    milestone: unknown | null;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    author_association: string;
    body: string | null;
    reactions: GitHubReactions;
    timeline_url: string;
    performed_via_github_app: unknown | null;
    state_reason: string | null;
    sub_issues_summary: SubIssuesSummary;
    active_lock_reason: string | null;
    pull_request?: unknown;
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
