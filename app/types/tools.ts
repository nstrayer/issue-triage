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

export interface SetIssueStatusArgs {
    issueNumber: number;
    currentStatus: string | null;
    suggestedStatus: string;
    reason: string;
}

export interface CategorizeIssueTypeArgs {
    issueNumber: number;
    issueContent: string;
    currentLabels: string[];
}

export interface GetIssueActivityArgs {
    issueNumber: number;
    lookbackPeriod?: number;
}

export interface SearchExternalContentArgs {
    query: string;
    country?: string;
    search_lang?: string;
    result_filter?: string[];
    summary?: boolean;
}

export interface GetDiscussionByIdArgs {
    discussionId: string;
}

// Union type of all possible tool call arguments
export type ToolCallArgs =
    | { toolName: 'getGithubIssue'; args: GetGithubIssueArgs }
    | { toolName: 'searchIssuesByLabels'; args: SearchIssuesByLabelsArgs }
    | { toolName: 'setSuggestedLabels'; args: SetSuggestedLabelsArgs }
    | { toolName: 'getRepositoryLabels'; args: GetRepositoryLabelsArgs }
    | { toolName: 'setIssueStatus'; args: SetIssueStatusArgs }
    | { toolName: 'categorizeIssueType'; args: CategorizeIssueTypeArgs }
    | { toolName: 'getIssueActivity'; args: GetIssueActivityArgs }
    | { toolName: 'searchExternalContent'; args: SearchExternalContentArgs }
    | { toolName: 'getDiscussionById'; args: GetDiscussionByIdArgs }; 