import { z } from 'zod';

/**
 * Base interface for tool responses
 */
export interface ToolResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Base interface for tool definitions
 */
export interface BaseTool<TInput, TOutput> {
  name: string;
  description: string;
  parameters: z.ZodType<TInput>;
  execute: (args: TInput) => Promise<ToolResponse<TOutput>>;
}

/**
 * Error codes for tool operations
 */
export enum ToolErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  GITHUB_API_ERROR = 'GITHUB_API_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Creates a standardized error response
 */
export function createToolError(
  code: ToolErrorCode,
  message: string,
  details?: unknown
): ToolResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Creates a standardized success response
 */
export function createToolSuccess<T>(data: T): ToolResponse<T> {
  return {
    success: true,
    data,
  };
}
