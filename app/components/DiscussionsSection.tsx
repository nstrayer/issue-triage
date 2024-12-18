import React, { useState } from 'react';
import { GithubDiscussion } from '../types/chat';
import { formatDateTime } from '../utils/dateFormatters';
import { ActionButtons } from './ActionButtons';

interface DiscussionsSectionProps {
  /**
   * Array of fetched GitHub discussions.
   */
  discussions: GithubDiscussion[] | undefined;

  /**
   * Whether GitHub discussions are currently loading.
   */
  isLoadingDiscussions: boolean;

  /**
   * Any error that occurred while loading GitHub discussions.
   */
  discussionsError: Error | null;

  /**
   * Handler for selecting a discussion to view.
   * @param discussion The chosen discussion object
   */
  onDiscussionSelect: (discussion: GithubDiscussion) => void;

  /**
   * Callback invoked when the user requests suggested actions for a discussion.
   * @param discussionId The discussion's GraphQL node ID
   */
  onSuggestActions: (discussionId: string) => void;
}

/**
 * Renders a list of GitHub discussions along with:
 * - Loading states
 * - Error states
 * - Action buttons
 * @param props DiscussionsSectionProps
 * @returns A React component displaying the discussion section of the sidebar
 *
 * @example
 * <DiscussionsSection
 *   discussions={[...]}
 *   isLoadingDiscussions={false}
 *   discussionsError={null}
 *   onDiscussionSelect={(disc) => console.log('Selected discussion:', disc)}
 *   onSuggestActions={(id) => console.log('Suggesting actions for discussion:', id)}
 * />
 */
export function DiscussionsSection({
  discussions,
  isLoadingDiscussions,
  discussionsError,
  onDiscussionSelect,
  onSuggestActions,
}: DiscussionsSectionProps) {
  const [showNoCommentsOnly, setShowNoCommentsOnly] = useState(false);

  if (isLoadingDiscussions) {
    return <div className="text-gray-500">Loading discussions...</div>;
  }

  if (discussionsError) {
    return <div className="text-red-500">{discussionsError.message}</div>;
  }

  if (!discussions) {
    return null;
  }

  const filteredDiscussions = showNoCommentsOnly
    ? discussions.filter((discussion) => discussion.comments.nodes.length === 0)
    : discussions;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Discussions</h2>
        <button
          onClick={() => setShowNoCommentsOnly(!showNoCommentsOnly)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            showNoCommentsOnly
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {showNoCommentsOnly ? 'Show All' : 'No Comments Only'}
        </button>
      </div>
      <div className="space-y-3">
        {filteredDiscussions.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No discussions left!</div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    discussion.closed
                      ? 'bg-red-100 text-red-800'
                      : discussion.isAnswered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {discussion.closed
                    ? 'Closed'
                    : discussion.isAnswered
                    ? 'Answered'
                    : 'Open'}
                </span>
              </div>

              <div className="text-sm font-medium truncate">
                <a
                  href={discussion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {discussion.title}
                </a>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <img
                  src={discussion.author.avatarUrl}
                  alt={`${discussion.author.login}'s avatar`}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-xs text-gray-600">{discussion.author.login}</span>
                <span className="text-xs text-gray-400">
                  {discussion.authorAssociation !== 'NONE' &&
                    `(${discussion.authorAssociation.toLowerCase()})`}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{formatDateTime(discussion.createdAt)}</span>
                <span>{discussion.comments.nodes.length} comments</span>
              </div>

              <ActionButtons
                onViewDetails={() => onDiscussionSelect(discussion)}
                onSuggestActions={() => onSuggestActions(discussion.id)}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
} 