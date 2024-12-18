import React from 'react';
import { GithubIssue, SuggestedLabels } from '../types/chat';
import { formatDateTime } from '../utils/dateFormatters';
import { ActionButtons } from './ActionButtons';

interface IssuesSectionProps {
  /**
   * Whether GitHub issues are currently loading.
   */
  isLoadingGithub: boolean;

  /**
   * Any error that occurred while loading GitHub issues.
   */
  githubError: Error | null;

  /**
   * Array of fetched GitHub issues.
   */
  issues: GithubIssue[] | undefined;

  /**
   * A mapping of issue numbers to suggested labels.
   */
  suggestedLabels: SuggestedLabels;

  /**
   * Callback invoked when the user requests suggested actions for an issue.
   * @param issueNumber The issue number from GitHub
   */
  onSuggestActions: (issueNumber: number) => void;

  /**
   * Callback invoked when the user clicks "View Details" for a particular issue.
   * @param issue The selected GitHub issue
   */
  onIssueSelect: (issue: GithubIssue) => void;
}

/**
 * Renders a list of GitHub issues along with:
 * - Loading states
 * - Error states
 * - Suggested labels
 * @param props IssuesSectionProps
 * @returns A React component displaying the issues section of the sidebar
 *
 * @example
 * <IssuesSection
 *   isLoadingGithub={false}
 *   githubError={null}
 *   issues={[...]}
 *   suggestedLabels={{ 123: ['bug', 'documentation'] }}
 *   onSuggestActions={(issueNumber) => console.log('Suggesting actions for issue:', issueNumber)}
 *   onIssueSelect={(issue) => console.log('Selected issue:', issue)}
 * />
 */
export function IssuesSection({
  isLoadingGithub,
  githubError,
  issues,
  suggestedLabels,
  onSuggestActions,
  onIssueSelect,
}: IssuesSectionProps) {
  if (isLoadingGithub) {
    return <div className="text-gray-500">Loading issues...</div>;
  }

  if (githubError) {
    return <div className="text-red-500">{githubError.message}</div>;
  }

  if (!issues) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-4">Intake Issues</h2>
      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.number}
            className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors p-3"
          >
            {/* Show suggested labels if available */}
            {suggestedLabels[issue.number] && (
              <div className="mb-2 p-2 bg-blue-50 rounded-md">
                <div className="text-xs font-medium text-blue-700 mb-1">Suggested Labels:</div>
                <div className="flex flex-wrap gap-1">
                  {suggestedLabels[issue.number].map((label, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  issue.state === 'open'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {issue.state}
              </span>
              <span className="text-sm text-gray-600">#{issue.number}</span>
              <a
                href={`https://github.com/posit-dev/positron/issues/${issue.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <div className="text-sm font-medium truncate">{issue.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              Created: {formatDateTime(issue.createdAt)}
            </div>

            <ActionButtons
              onViewDetails={() => onIssueSelect(issue)}
              onSuggestActions={() => onSuggestActions(issue.number)}
            />
          </div>
        ))}
      </div>
    </section>
  );
} 