import { useState } from 'react';
import { GithubIssue, SuggestedLabels, GithubDiscussion } from '../types/chat';
import { IssueModal } from './IssueModal';
import { DiscussionModal } from './DiscussionModal';
import { useGithubDiscussions } from '../hooks/useGithubDiscussions';
import { IssuesSection } from './IssuesSection';
import { DiscussionsSection } from './DiscussionsSection';

interface SidebarProps {
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
   */
  onSuggestActions: (issueNumber: number|string) => void;

  /**
   * Callback invoked when the user applies labels to an issue.
   */
  onApplyLabels: (issueNumber: number, labels: string[]) => void;

  /**
   * Whether labels are currently being applied.
   */
  isApplyingLabels: boolean;
}

/**
 * The main Sidebar component that houses issue and discussion data,
 * along with modals for viewing details. This component coordinates
 * state for the modals and integrates the IssuesSection and
 * DiscussionsSection for display in a unified layout.
 *
 * @param props SidebarProps
 * @returns A React component rendering the sidebar
 *
 * @example
 * <Sidebar
 *   isLoadingGithub={false}
 *   githubError={null}
 *   issues={[...]}
 *   suggestedLabels={{ ... }}
 *   onSuggestActions={() => {...}}
 *   onApplyLabels={() => {...}}
 *   isApplyingLabels={false}
 * />
 */
export function Sidebar({
  isLoadingGithub,
  githubError,
  issues,
  suggestedLabels,
  onSuggestActions,
  onApplyLabels,
  isApplyingLabels,
}: SidebarProps) {
  // Local state for tracking selected issue/discussion and modal visibility
  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<GithubDiscussion | null>(null);
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);

  // Fetch discussions
  const {
    discussions,
    isLoading: isLoadingDiscussions,
    error: discussionsError
  } = useGithubDiscussions();

  /**
   * Handles when a user selects an issue to view details.
   */
  const handleIssueSelect = (issue: GithubIssue): void => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  /**
   * Handles when a user selects a discussion to view.
   */
  const handleDiscussionSelect = (discussion: GithubDiscussion): void => {
    setSelectedDiscussion(discussion);
    setIsDiscussionModalOpen(true);
  };

  /**
   * Handles when a user requests suggested actions for a discussion.
   */
  const handleDiscussionSuggestActions = (discussionId: string): void => {
    onSuggestActions(discussionId);
  };

  return (
    <div className="h-full border-r border-gray-200 p-4 overflow-y-auto">
      {/* Issues Section */}
      <IssuesSection
        isLoadingGithub={isLoadingGithub}
        githubError={githubError}
        issues={issues}
        suggestedLabels={suggestedLabels}
        onSuggestActions={onSuggestActions}
        onIssueSelect={handleIssueSelect}
      />

      {/* Discussions Section */}
      <DiscussionsSection
        discussions={discussions}
        isLoadingDiscussions={isLoadingDiscussions}
        discussionsError={discussionsError}
        onDiscussionSelect={handleDiscussionSelect}
        onSuggestActions={handleDiscussionSuggestActions}
      />

      {/* Issue Modal */}
      <IssueModal
        issue={selectedIssue}
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedIssue(null);
        }}
        suggestedLabels={selectedIssue ? suggestedLabels[selectedIssue.number] : []}
        onApplyLabels={onApplyLabels}
        isApplyingLabels={isApplyingLabels}
      />

      {/* Discussion Modal */}
      <DiscussionModal
        discussion={selectedDiscussion}
        isOpen={isDiscussionModalOpen}
        onClose={() => {
          setIsDiscussionModalOpen(false);
          setSelectedDiscussion(null);
        }}
      />
    </div>
  );
} 