import { ToolInvocation, ExpandedTools } from '../types/chat';

interface ToolResultProps {
  toolInvocation: ToolInvocation;
  isExpanded: boolean;
  onToggleExpand: (toolCallId: string) => void;
}

export function ToolResult({
  toolInvocation,
  isExpanded,
  onToggleExpand,
}: ToolResultProps) {
  const { toolCallId, toolName, args, state, result } = toolInvocation;

  return (
    <div className="text-xs">
      <div className="text-gray-500 mb-1 flex items-center gap-2">
        <span>Using tool: <span className="font-medium">{toolName}</span></span>
        {args && (
          <span className="text-gray-400">
            (
            {Object.entries(args).map(([key, value], index, arr) => (
              <span key={key}>
                {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                {index < arr.length - 1 ? ', ' : ''}
              </span>
            ))}
            )
          </span>
        )}
      </div>

      <button
        onClick={() => onToggleExpand(toolCallId)}
        className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
      >
        <svg
          className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
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
        {isExpanded ? 'Hide' : 'Show'} details
      </button>

      {isExpanded && (
        <div className="ml-4 space-y-2">
          {state === 'partial-call' ? (
            <>
              <div className="text-gray-500">Arguments:</div>
              <div className="bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(args, null, 2)}
                </pre>
              </div>
            </>
          ) : 'result' in toolInvocation ? (
            <>
              <div className="text-gray-500">Result:</div>
              <div className="bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap">
                  {typeof result === 'string'
                    ? result
                    : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-gray-500">
              Processing...
            </div>
          )}
        </div>
      )}
    </div>
  );
} 