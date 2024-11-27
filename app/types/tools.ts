/**
 * Shared type definitions for tool calls between client and server
 */

export interface GetGithubIssueArgs {
    issueNumber: number;
}

export interface SearchIssuesByLabelsArgs {
    labels: string[];
    limit: number;
}

export interface SetSuggestedLabelsArgs {
    issueNumber: number;
    suggestedLabels: string[];
}

export interface GetRepositoryLabelsArgs {
    // Empty object as this tool takes no parameters
}

// Union type of all possible tool call arguments
export type ToolCallArgs =
    | { toolName: 'getGithubIssue'; args: GetGithubIssueArgs }
    | { toolName: 'searchIssuesByLabels'; args: SearchIssuesByLabelsArgs }
    | { toolName: 'setSuggestedLabels'; args: SetSuggestedLabelsArgs }
    | { toolName: 'getRepositoryLabels'; args: GetRepositoryLabelsArgs }; 