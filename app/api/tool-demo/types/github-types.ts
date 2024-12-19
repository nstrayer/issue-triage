/**
 * Valid status values for GitHub issues
 */
export const VALID_STATUSES = [
  '',
  'Triage',
  'Backlog',
  'Up Next',
  'In Progress',
  'PR Ready',
  'Ready for Verification',
  'In Verification',
  'Done'
] as const;

export type ValidStatus = typeof VALID_STATUSES[number];

/**
 * Response type for status update operations
 */
export interface StatusUpdateResponse {
  previousStatus: string;
  newStatus: ValidStatus;
  message: string;
}
