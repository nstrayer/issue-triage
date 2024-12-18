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
    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
      <button
        onClick={onViewDetails}
        className="flex-1 px-3 py-1.5 bg-white text-sm font-medium text-gray-600 rounded-md border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
      >
        View Details
      </button>
      <button
        onClick={onSuggestActions}
        className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors"
      >
        Suggest Actions
      </button>
    </div>
  );
} 