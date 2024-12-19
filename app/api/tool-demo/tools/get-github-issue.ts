import { z } from 'zod';
import { githubService } from '../../../services/github';
import { BaseTool, ToolErrorCode, createToolError, createToolSuccess } from '../types/tool-types';
import { GithubIssue, GithubIssueNode } from '../../../types/chat';

/**
 * Input parameters schema for getGithubIssue
 */
const getGithubIssueSchema = z.object({
  issueNumber: z.number()
    .int()
    .positive()
    .describe('The issue number to fetch'),
});

type GetGithubIssueInput = z.infer<typeof getGithubIssueSchema>;

/**
 * Transforms an Octokit issue response into our GithubIssue type
 */
function transformIssue(octokitIssue: any): GithubIssue {
  const issueNode: GithubIssueNode = {
    title: octokitIssue.title,
    number: octokitIssue.number,
    createdAt: octokitIssue.created_at,
    url: octokitIssue.html_url,
    body: octokitIssue.body || '',
    state: octokitIssue.state,
    author: {
      avatarUrl: octokitIssue.user.avatar_url,
      login: octokitIssue.user.login,
      url: octokitIssue.user.html_url,
    },
    comments: {
      totalCount: octokitIssue.comments,
      nodes: [], // Comments require a separate API call if needed
    },
    labels: {
      nodes: octokitIssue.labels.map((label: any) => ({
        name: label.name,
        color: label.color,
      })),
    },
    assignees: {
      nodes: octokitIssue.assignees.map((assignee: any) => ({
        avatarUrl: assignee.avatar_url,
        login: assignee.login,
        url: assignee.html_url,
      })),
    },
    projectItems: {
      nodes: [], // Project items require a separate GraphQL query if needed
    },
  };

  return {
    ...issueNode,
    labelsParsed: issueNode.labels.nodes.map(label => label.name),
  };
}

/**
 * Tool for fetching a specific GitHub issue by number
 */
export const getGithubIssue: BaseTool<GetGithubIssueInput, GithubIssue> = {
  name: 'getGithubIssue',
  description: 'Fetches a specific GitHub issue by its number',
  parameters: getGithubIssueSchema,
  
  async execute({ issueNumber }) {
    try {
      // Validate input
      const validationResult = getGithubIssueSchema.safeParse({ issueNumber });
      if (!validationResult.success) {
        return createToolError(
          ToolErrorCode.VALIDATION_ERROR,
          'Invalid input parameters',
          validationResult.error
        );
      }

      // Fetch issue from GitHub
      const octokitIssue = await githubService.getIssue(issueNumber);
      
      if (!octokitIssue) {
        return createToolError(
          ToolErrorCode.NOT_FOUND,
          `Issue #${issueNumber} not found`
        );
      }

      // Transform the Octokit response into our GithubIssue type
      const issue = transformIssue(octokitIssue);

      return createToolSuccess(issue);
    } catch (error) {
      console.error('Error in getGithubIssue:', error);
      
      if (error instanceof Error) {
        return createToolError(
          ToolErrorCode.GITHUB_API_ERROR,
          `Failed to fetch issue: ${error.message}`,
          error
        );
      }
      
      return createToolError(
        ToolErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred while fetching the issue',
        error
      );
    }
  },
};
