import React from 'react';
import { GithubDiscussion } from '../types/chat';
import { formatDateTime } from '../utils/dateFormatters';

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
}

/**
 * Renders a list of GitHub discussions along with:
 * - Loading states
 * - Error states
 * @param props DiscussionsSectionProps
 * @returns A React component displaying the discussion section of the sidebar
 *
 * @example
 * <DiscussionsSection
 *   discussions={[...]}
 *   isLoadingDiscussions={false}
 *   discussionsError={null}
 *   onDiscussionSelect={(disc) => console.log('Selected discussion:', disc)}
 * />
 */
export function DiscussionsSection({
  discussions,
  isLoadingDiscussions,
  discussionsError,
  onDiscussionSelect,
}: DiscussionsSectionProps) {
  if (isLoadingDiscussions) {
    return <div className="text-gray-500">Loading discussions...</div>;
  }

  if (discussionsError) {
    return <div className="text-red-500">{discussionsError.message}</div>;
  }

  if (!discussions) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-bold mb-4">Discussions</h2>
      <div className="space-y-3">
        {discussions.map((discussion) => (
          <div
            key={discussion.id}
            className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors p-3 cursor-pointer"
            onClick={() => onDiscussionSelect(discussion)}
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
          </div>
        ))}
      </div>
    </section>
  );
} 