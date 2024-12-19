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
    <div className="mb-8 bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Helper Chat</h3>
            <p className="text-sm text-gray-500">AI-powered assistance for issue triage</p>
          </div>
        </div>
        <button
          onClick={onToggleVisibility}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
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
          {isVisible ? 'Hide' : 'Show'} Instructions
        </button>
      </div>

      {isVisible && (
        <div className="border-t border-gray-100">
          <div className="p-4 text-sm text-gray-600">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 