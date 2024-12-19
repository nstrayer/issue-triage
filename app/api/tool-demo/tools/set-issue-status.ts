import { z } from 'zod';
import { githubService } from '../../../services/github';
import { BaseTool, ToolErrorCode, createToolError, createToolSuccess } from '../types/tool-types';
import { VALID_STATUSES, ValidStatus, StatusUpdateResponse } from '../types/github-types';

/**
 * Input parameters schema for setIssueStatus
 */
const setIssueStatusSchema = z.object({
  issueNumber: z.number()
    .int()
    .positive()
    .describe('The GitHub issue number to update'),
  currentStatus: z.string()
    .nullable()
    .describe('The current status value if any'),
  suggestedStatus: z.enum(VALID_STATUSES)
    .describe('The proposed new status value'),
  reason: z.string()
    .min(1)
    .describe('Justification for the status change'),
});

type SetIssueStatusInput = z.infer<typeof setIssueStatusSchema>;

/**
 * Tool for updating the status of a GitHub issue
 */
export const setIssueStatus: BaseTool<SetIssueStatusInput, StatusUpdateResponse> = {
  name: 'setIssueStatus',
  description: 'Updates the status field of a GitHub issue based on workflow rules',
  parameters: setIssueStatusSchema,
  
  async execute({ issueNumber, currentStatus, suggestedStatus, reason }) {
    try {
      // Validate input
      const validationResult = setIssueStatusSchema.safeParse({
        issueNumber,
        currentStatus,
        suggestedStatus,
        reason,
      });

      if (!validationResult.success) {
        return createToolError(
          ToolErrorCode.VALIDATION_ERROR,
          'Invalid input parameters',
          validationResult.error
        );
      }

      // Get current issue state to validate transitions
      const issue = await githubService.getIssue(issueNumber);
      
      if (!issue) {
        return createToolError(
          ToolErrorCode.NOT_FOUND,
          `Issue #${issueNumber} not found`
        );
      }

      // Validate status transitions
      if (suggestedStatus === 'Done' && issue.state_reason !== 'completed') {
        return createToolError(
          ToolErrorCode.VALIDATION_ERROR,
          'Cannot set status to Done for non-completed issues'
        );
      }

      // Update the issue with new status
      const updatedBody = `${issue.body}\n\nStatus: ${suggestedStatus}\nReason: ${reason}`;
      
      try {
        await githubService.updateIssue(issueNumber, {
          body: updatedBody,
        });
      } catch (error) {
        return createToolError(
          ToolErrorCode.GITHUB_API_ERROR,
          'Failed to update issue status',
          error
        );
      }

      return createToolSuccess({
        previousStatus: currentStatus || '',
        newStatus: suggestedStatus,
        message: `Successfully updated issue #${issueNumber} status to "${suggestedStatus}". Reason: ${reason}`,
      });
    } catch (error) {
      console.error('Error in setIssueStatus:', error);
      
      if (error instanceof Error) {
        return createToolError(
          ToolErrorCode.GITHUB_API_ERROR,
          `Failed to update status: ${error.message}`,
          error
        );
      }
      
      return createToolError(
        ToolErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred while updating issue status',
        error
      );
    }
  },
};
