import React from 'react';
import { GithubIssue, SuggestedLabels } from '../types/chat';
import { formatDateTime } from '../utils/dateFormatters';
import { ItemCard } from './ItemCard';

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
          <ItemCard
            key={issue.number}
            title={issue.title}
            url={`https://github.com/posit-dev/positron/issues/${issue.number}`}
            author={issue.author}
            authorAssociation={issue.authorAssociation}
            createdAt={formatDateTime(issue.createdAt)}
            status={{
              label: issue.state,
              variant: issue.state === 'open' ? 'green' : 'purple'
            }}
            identifier={`#${issue.number}`}
            metadata={
              <span>{issue.comments.totalCount} comments</span>
            }
            body={issue.body}
            topContent={
              suggestedLabels[issue.number] && (
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
              )
            }
            onViewDetails={() => onIssueSelect(issue)}
            onSuggestActions={() => onSuggestActions(issue.number)}
          />
        ))}
      </div>
    </section>
  );
}
