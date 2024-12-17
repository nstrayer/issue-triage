import { useState } from 'react';
import { GithubIssue, SuggestedLabels } from '../types/chat';
import { IssueModal } from './IssueModal';

interface SidebarProps {
  isLoadingGithub: boolean;
  githubError: Error | null;
  issues: GithubIssue[] | undefined;
  suggestedLabels: SuggestedLabels;
  onSuggestActions: (issueNumber: number) => void;
  onApplyLabels: (issueNumber: number, labels: string[]) => void;
  isApplyingLabels: boolean;
}

export function Sidebar({
  isLoadingGithub,
  githubError,
  issues,
  suggestedLabels,
  onSuggestActions,
  onApplyLabels,
  isApplyingLabels,
}: SidebarProps) {
  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-80 h-full border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Unlabeled Issues</h2>
      {isLoadingGithub ? (
        <div className="text-gray-500">Loading issues...</div>
      ) : githubError ? (
        <div className="text-red-500">{githubError.message}</div>
      ) : issues ? (
        <div className="space-y-3">
          {issues.map(issue => (
            <div
              key={issue.number}
              className="relative group border border-gray-200 rounded-md hover:border-gray-300 transition-colors p-3"
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

              {/* Action buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => {
                    setSelectedIssue(issue);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 bg-white text-sm font-medium text-gray-600 rounded-md shadow hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => onSuggestActions(issue.number)}
                  className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Suggest Actions
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded ${
                  issue.state === 'open'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div className="text-sm font-medium truncate">
                {issue.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(issue.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Issue Modal */}
      <IssueModal
        issue={selectedIssue}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIssue(null);
        }}
        suggestedLabels={selectedIssue ? suggestedLabels[selectedIssue.number] : []}
        onApplyLabels={onApplyLabels}
        isApplyingLabels={isApplyingLabels}
      />
    </div>
  );
} 