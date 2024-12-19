import React, { useState } from 'react';
import { GithubDiscussion } from '../types/chat';
import { formatDateTime } from '../utils/dateFormatters';
import { ItemCard } from './ItemCard';

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

  const getStatusVariant = (discussion: GithubDiscussion): 'red' | 'green' | 'yellow' => {
    if (discussion.closed) return 'red';
    if (discussion.isAnswered) return 'green';
    return 'yellow';
  };

  const getStatusLabel = (discussion: GithubDiscussion): string => {
    if (discussion.closed) return 'Closed';
    if (discussion.isAnswered) return 'Answered';
    return 'Open';
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Discussions</h2>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showNoCommentsOnly}
            onChange={(e) => setShowNoCommentsOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Filter to no comments
        </label>
      </div>
      <div className="space-y-3">
        {filteredDiscussions.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No discussions left!</div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <ItemCard
              key={discussion.id}
              title={discussion.title}
              url={discussion.url}
              author={discussion.author}
              createdAt={formatDateTime(discussion.createdAt)}
              status={{
                label: getStatusLabel(discussion),
                variant: getStatusVariant(discussion)
              }}
              metadata={
                <span>{discussion.comments.nodes.length} comments</span>
              }
              body={discussion.bodyText}
              onViewDetails={() => onDiscussionSelect(discussion)}
              onSuggestActions={() => onSuggestActions(discussion.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
