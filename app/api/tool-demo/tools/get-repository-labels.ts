import { z } from 'zod';
import { githubService } from '../../../services/github';
import { BaseTool, ToolErrorCode, createToolError, createToolSuccess } from '../types/tool-types';
import { GitHubLabel } from '../../../types/chat';

/**
 * Input parameters schema for getRepositoryLabels
 * This tool doesn't require any parameters, but we still define an empty schema
 */
const getRepositoryLabelsSchema = z.object({});

type GetRepositoryLabelsInput = z.infer<typeof getRepositoryLabelsSchema>;

/**
 * Tool for fetching all labels from the repository
 */
export const getRepositoryLabels: BaseTool<GetRepositoryLabelsInput, GitHubLabel[]> = {
  name: 'getRepositoryLabels',
  description: 'Fetches all available labels in the repository',
  parameters: getRepositoryLabelsSchema,
  
  async execute() {
    try {
      // Fetch labels from GitHub
      const labels = await githubService.fetchLabels();
      
      if (!labels) {
        return createToolError(
          ToolErrorCode.NOT_FOUND,
          'No labels found in the repository'
        );
      }

      return createToolSuccess(labels);
    } catch (error) {
      console.error('Error in getRepositoryLabels:', error);
      
      if (error instanceof Error) {
        return createToolError(
          ToolErrorCode.GITHUB_API_ERROR,
          `Failed to fetch labels: ${error.message}`,
          error
        );
      }
      
      return createToolError(
        ToolErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred while fetching repository labels',
        error
      );
    }
  },
};
