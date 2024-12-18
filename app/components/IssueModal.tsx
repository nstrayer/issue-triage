import { GithubIssue } from '../types/chat';
import ReactMarkdown from 'react-markdown';

interface IssueModalProps {
  issue: GithubIssue | null;
  isOpen: boolean;
  onClose: () => void;
  suggestedLabels?: string[];
  onApplyLabels?: (issueNumber: number, labels: string[]) => void;
  isApplyingLabels?: boolean;
}

/**
 * Removes HTML comments from a string
 * @param text The text to process
 * @returns The text with HTML comments removed
 */
function removeHtmlComments(text: string): string {
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

export function IssueModal({ 
  issue, 
  isOpen, 
  onClose, 
  suggestedLabels = [], 
  onApplyLabels,
  isApplyingLabels = false,
}: IssueModalProps) {
  if (!isOpen || !issue) return null;

  const issueUrl = `https://github.com/posit-dev/positron/issues/${issue.number}`;
  const cleanBody = removeHtmlComments(issue.body || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Issue #{issue.number}</h2>
            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Open in GitHub
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isApplyingLabels}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-gray-900 mb-4">{issue.title}</h3>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                issue.state === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {issue.state}
              </span>
            </div>

            {/* Current Labels */}
            {issue.labelsParsed && issue.labelsParsed.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Labels:</h4>
                <div className="flex flex-wrap gap-2">
                    {issue.labelsParsed.map((label, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Labels */}
            {suggestedLabels.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-900">Suggested Labels</h4>
                  <button
                    onClick={() => onApplyLabels?.(issue.number, suggestedLabels)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isApplyingLabels}
                  >
                    {isApplyingLabels ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Applying...
                      </>
                    ) : (
                      'Apply Suggestions'
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedLabels.map((label, index) => (
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

            {/* Issue Body */}
            <div className="prose prose-gray prose-headings:font-semibold prose-a:text-blue-600 prose-code:text-blue-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 max-w-none">
              <ReactMarkdown>{cleanBody}</ReactMarkdown>
            </div>

            {/* Comments Section */}
            {issue.comments.nodes.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Comments ({issue.comments.totalCount})</h4>
                <div className="space-y-6">
                  {issue.comments.nodes.map((comment, index) => (
                    <div key={index} className="border-t border-gray-200 pt-4">
                      {/* Comment Author Information */}
                      <div className="flex items-center gap-2 mb-4">
                        <img
                          src={comment.author.avatarUrl}
                          alt={`${comment.author.login}'s avatar`}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-sm text-gray-600">
                          {comment.author.login}
                        </span>
                        {comment.authorAssociation !== 'NONE' && (
                          <span className="text-xs text-gray-400">
                            ({comment.authorAssociation.toLowerCase()})
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          • {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="prose prose-gray prose-sm max-w-none">
                        <ReactMarkdown>{comment.body}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="text-sm text-gray-500">
            To participate in the discussion, please use the "Open in GitHub" button.
          </div>
        </div>
      </div>
    </div>
  );
} 