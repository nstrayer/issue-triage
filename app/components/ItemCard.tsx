import React, { ReactNode, useMemo } from 'react';
import { marked } from 'marked';
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
  authorAssociation: 'MEMBER' | 'OWNER' | 'MANNEQUIN' | 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIME_CONTRIBUTOR' | 'FIRST_TIMER' | 'NONE';

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
   * Optional body content to display
   */
  body?: string;

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
  authorAssociation,
  createdAt,
  status,
  identifier,
  topContent,
  metadata,
  body,
  onViewDetails,
  onSuggestActions,
}: ItemCardProps) {
  // Process markdown and create preview
  const bodyPreview = useMemo(() => {
    if (!body) return '';
    
    // Remove markdown syntax using marked.parse (synchronous version)
    const plainText = marked.parse(body, { async: false }) as string;
    
    // Clean up HTML and get preview
    return plainText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Replace HTML entities with space
      .trim()
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 3)
      .join('\n')
      .slice(0, 300); // Allow more characters for 3 lines
  }, [body]);
  const statusColorClasses = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300 transition-all duration-200">
      <div className="p-4">
        {topContent}

        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColorClasses[status.variant]}`}
          >
            {status.label}
          </span>
          {identifier && (
            <span className="text-sm font-medium text-gray-500">
              {identifier}
            </span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
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

        <div className="mb-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {title}
          </a>
        </div>

        {bodyPreview && (
          <div className="mb-2">
            <p className="text-xs text-gray-400 line-clamp-3 whitespace-pre-line opacity-90">
              {bodyPreview}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={author.avatarUrl}
                  alt={`${author.login}'s avatar`}
                  className="w-5 h-5 rounded-full ring-2 ring-white"
                />
                {(authorAssociation === 'MEMBER' || authorAssociation === 'OWNER') && (
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"
                    title={`${author.login} is a ${authorAssociation.toLowerCase()} of the repository`}
                  >
                    <span className="sr-only">Internal team member</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <span className="font-medium">{author.login}</span>
            </div>
          <ItemMetadata createdAt={createdAt} metadata={metadata} />
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <ActionButtons
          onViewDetails={onViewDetails}
          onSuggestActions={onSuggestActions}
        />
      </div>
    </div>
  );
}
