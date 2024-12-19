import React from 'react';

interface ActionButtonsProps {
  /**
   * Handler for the "View Details" button click
   */
  onViewDetails: () => void;

  /**
   * Handler for the "Suggest Actions" button click
   */
  onSuggestActions: () => void;
}

/**
 * A reusable component for rendering action buttons that appear in both
 * the IssuesSection and DiscussionsSection.
 * 
 * @param props ActionButtonsProps
 * @returns A React component containing the action buttons
 */
export function ActionButtons({
  onViewDetails,
  onSuggestActions,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onViewDetails}
        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 h-9 px-4 py-2"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View Details
      </button>
      <button
        onClick={onSuggestActions}
        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-500 h-9 px-4 py-2"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Suggest Actions
      </button>
    </div>
  );
} 