import { GithubDiscussion } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import { formatDateTime } from '../utils/dateFormatters';
import { useEffect, useRef } from 'react';

interface DiscussionModalProps {
  discussion: GithubDiscussion | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Removes HTML comments from a string
 * @param text The text to process
 * @returns The text with HTML comments removed
 */
function removeHtmlComments(text: string): string {
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

export function DiscussionModal({ 
  discussion, 
  isOpen, 
  onClose,
}: DiscussionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !discussion) return null;

  const cleanBody = removeHtmlComments(discussion.body || '');

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div 
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Discussion</h2>
            <a
              href={discussion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-action-button-secondary"
            >
              Open in GitHub
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
            aria-label="Close dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-gray-900 mb-4">{discussion.title}</h3>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>Created: {formatDateTime(discussion.createdAt)}</span>
              <span className={`modal-label ${
                discussion.closed
                  ? 'modal-label-error'
                  : discussion.isAnswered
                  ? 'modal-label-success'
                  : 'modal-label-warning'
              }`}>
                {discussion.closed
                  ? 'Closed'
                  : discussion.isAnswered
                  ? 'Answered'
                  : 'Open'}
              </span>
            </div>

            {/* Author Information */}
            <div className="flex items-center gap-2 mb-6">
              <img
                src={discussion.author.avatarUrl}
                alt={`${discussion.author.login}'s avatar`}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">
                {discussion.author.login}
              </span>
              {discussion.authorAssociation !== 'NONE' && (
                <span className="text-xs text-gray-400">
                  ({discussion.authorAssociation.toLowerCase()})
                </span>
              )}
            </div>

            {/* Discussion Body */}
            <div className="prose prose-gray prose-headings:font-semibold prose-a:text-blue-600 prose-code:text-blue-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 max-w-none">
              <ReactMarkdown>{cleanBody}</ReactMarkdown>
            </div>

            {/* Comments Section */}
            {discussion.comments.nodes.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Comments</h4>
                <div className="space-y-6">
                  {discussion.comments.nodes.map((comment, index) => (
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
                          • {formatDateTime(comment.createdAt)}
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
        <div className="modal-footer">
          <div className="text-sm text-gray-500">
            To participate in the discussion, please use the "Open in GitHub" button.
          </div>
        </div>
      </div>
    </div>
  );
} 