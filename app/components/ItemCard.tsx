import React, { ReactNode } from 'react';
import { ActionButtons } from './ActionButtons';
import { ItemMetadata } from './ItemMetadata';

interface ItemCardProps {
  /**
   * The title of the item to display
   */
  title: string;

  /**
   * The URL to the item on GitHub
   */
  url: string;

  /**
   * The author's information
   */
  author: {
    avatarUrl: string;
    login: string;
  };

  /**
   * The creation date of the item
   */
  createdAt: string;

  /**
   * The status badge configuration
   */
  status: {
    label: string;
    variant: 'green' | 'purple' | 'red' | 'yellow';
  };

  /**
   * Optional identifier to display (e.g., issue number)
   */
  identifier?: string;

  /**
   * Optional additional content to display before the main content
   */
  topContent?: ReactNode;

  /**
   * Optional additional metadata to display
   */
  metadata?: ReactNode;

  /**
   * Handler for the "View Details" action
   */
  onViewDetails: () => void;

  /**
   * Handler for the "Suggest Actions" action
   */
  onSuggestActions: () => void;
}

/**
 * A reusable card component for displaying GitHub items (issues or discussions)
 * with consistent styling and layout.
 * 
 * @param props ItemCardProps
 * @returns A React component for displaying an item card
 */
export function ItemCard({
  title,
  url,
  author,
  createdAt,
  status,
  identifier,
  topContent,
  metadata,
  onViewDetails,
  onSuggestActions,
}: ItemCardProps) {
  const statusColorClasses = {
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors p-3 flex flex-col justify-between gap-2">
      {topContent}

      <div className="flex items-center gap-2 mb-1">
        <span
          className={`px-2 py-0.5 text-xs rounded ${statusColorClasses[status.variant]}`}
        >
          {status.label}
        </span>
        {identifier && <span className="text-sm text-gray-600">{identifier}</span>}
        <a
          href={url}
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

      <div className="text-sm font-medium truncate">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-blue-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {title}
        </a>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <img
            src={author.avatarUrl}
            alt={`${author.login}'s avatar`}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-gray-600">{author.login}</span>
        </div>
        <ItemMetadata createdAt={createdAt} metadata={metadata} />
      </div>


      <ActionButtons
        onViewDetails={onViewDetails}
        onSuggestActions={onSuggestActions}
      />
    </div>
  );
} 