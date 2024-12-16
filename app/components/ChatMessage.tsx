import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType, ExpandedTools } from '../types/chat';
import { ToolResult } from './ToolResult';

interface ChatMessageProps {
  message: ChatMessageType;
  expandedTools: ExpandedTools;
  onToggleToolExpansion: (toolCallId: string) => void;
}

export function ChatMessage({
  message,
  expandedTools,
  onToggleToolExpansion,
}: ChatMessageProps) {
  return (
    <div
      className={`p-3 rounded-lg ${
        message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
      }`}
    >
      <div className="text-sm prose prose-sm max-w-none">
        {message.role === 'assistant' && (
          <svg
            className="w-4 h-4 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )}
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              />
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              return (
                <code
                  {...props}
                  className={`${
                    isInline
                      ? 'bg-gray-200 px-1 py-0.5 rounded'
                      : 'block bg-gray-800 text-white p-2 rounded'
                  }`}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>

        {/* Tool invocations */}
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.toolInvocations.map((toolInvocation) => (
              <ToolResult
                key={toolInvocation.toolCallId}
                toolInvocation={toolInvocation}
                isExpanded={expandedTools[toolInvocation.toolCallId] || false}
                onToggleExpand={onToggleToolExpansion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 