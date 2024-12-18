import ReactMarkdown from 'react-markdown';

interface SystemPromptProps {
  content: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function SystemPrompt({
  content,
  isVisible,
  onToggleVisibility,
}: SystemPromptProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Helper Chat</h3>
        <button
          onClick={onToggleVisibility}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${
              isVisible ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {isVisible ? 'Hide' : 'Show'} System Instructions
        </button>
      </div>

      {isVisible && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
          <div className="font-semibold mb-2">System Instructions:</div>
          <div className="text-gray-600 whitespace-pre-wrap prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
} 