import React, { ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ItemMetadataProps {
  /**
   * ISO timestamp string for when the item was created
   */
  createdAt: string;

  /**
   * Optional additional metadata to display below the creation date
   */
  metadata?: ReactNode;
}

/**
 * Displays creation time and additional metadata for an item
 * Shows relative timestamp by default, with absolute time on hover
 *
 * @param props ItemMetadataProps
 * @returns A React component for displaying item metadata
 */
export function ItemMetadata({ createdAt, metadata }: ItemMetadataProps) {
  const relativeTime = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="ml-auto">
      <div className="text-gray-500">
        <span className="relative">
          <span 
            className="cursor-help peer"
            title={`Created: ${createdAt}`}
          >
            {relativeTime}
          </span>
          <span className="invisible peer-hover:visible absolute -top-8 right-0 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            Created: {createdAt}
          </span>
        </span>
      </div>
      {metadata && <div className="text-gray-500">{metadata}</div>}
    </div>
  );
}
