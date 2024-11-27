'use client';

import { useChat } from 'ai/react';
import { useGithubIssues } from './hooks/useGithubIssues';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ToolCallArgs, SetSuggestedLabelsArgs } from './types/tools';

// Simple tool interface
interface Tool {
  name: string;
  description: string;
  execute: () => void;
}

interface SuggestedLabels {
  [issueNumber: number]: string[];
}

export default function Chat() {
  const {
    githubData,
    isLoading: isLoadingGithub,
    error: githubError,
  } = useGithubIssues();

  const [suggestedLabels, setSuggestedLabels] = useState<SuggestedLabels>({});

  const {
    messages,
    input,
    append: addMessage,
    handleInputChange,
    handleSubmit,
    addToolResult,
    isLoading: isToolLoading,
    error: toolError,
    reload,
  } = useChat({
    api: '/api/tool-demo',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: `You are a helpful AI assistant with access to GitHub repository information. You have four tools available:

1. getGithubIssue: Use this to fetch a specific issue by its number
2. getRepositoryLabels: Use this to get a list of all available labels in the repository
3. searchIssuesByLabels: Use this to search for issues with specific labels and analyze labeling patterns. You can specify multiple labels and how many recent issues to examine (max 20)
4. setSuggestedLabels: Use this to set your suggested labels for a specific issue after analyzing it. You should only call this when explicitly asked to suggest labels

When suggesting labels for issues, follow this process:
1. Use getGithubIssue to fetch the issue details
2. Get the list of available labels using getRepositoryLabels
3. For each potential label:
   - Use searchIssuesByLabels to find similar past issues with that label
   - Analyze how the label has been used historically
   - Consider if the label fits the current issue
4. Call setSuggestedLabels with your final suggestions, providing:
   - The issue number
   - An array of label names that you think are appropriate

Remember to:
- Only suggest labels that exist in the repository (from getRepositoryLabels)
- Consider both the issue content and historical label usage patterns
- Base your suggestions on similar past issues
- Only call setSuggestedLabels when explicitly asked to suggest labels`
      }
    ],
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'setSuggestedLabels') {
        const { issueNumber, suggestedLabels: labels } = toolCall.args as SetSuggestedLabelsArgs;
        setSuggestedLabels(prev => ({
          ...prev,
          [issueNumber]: labels
        }));
        return `Set ${labels.length} suggested labels for issue #${issueNumber}`;
      }
    },
  });

  // Add state for tracking which tool results are expanded
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  // Toggle function for expanding/collapsing tool results
  const toggleToolExpansion = (messageId: string) => {
    setExpandedTools(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Function to handle suggesting labels for an issue
  const handleSuggestLabels = (issueNumber: number) => {
    addMessage({
      role: 'user',
      content: `Please suggest labels for issue #${issueNumber}`
    });

  };

  // Function to handle retrying the last message
  const handleRetry = () => {
    if (reload) {
      reload();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Title bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-10">
        <h1 className="text-xl font-bold text-gray-800">Positron Issue Triage</h1>
      </div>

      {/* Main content with padding for title bar */}
      <div className="flex w-full pt-14">
        {/* Sidebar with unlabeled issues */}
        <div className="w-80 h-full border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Unlabeled Issues</h2>
          {isLoadingGithub ? (
            <div className="text-gray-500">Loading issues...</div>
          ) : githubError ? (
            <div className="text-red-500">{githubError}</div>
          ) : githubData?.issues ? (
            <div className="space-y-3">
              {githubData.issues.map(issue => (
                <div
                  key={issue.number}
                  className="relative group border border-gray-200 rounded-md hover:border-gray-300 transition-colors p-3"
                >
                  {/* Show suggested labels if available */}
                  {suggestedLabels[issue.number] && (
                    <div className="mb-2 p-2 bg-blue-50 rounded-md">
                      <div className="text-xs font-medium text-blue-700 mb-1">Suggested Labels:</div>
                      <div className="flex flex-wrap gap-1">
                        {suggestedLabels[issue.number].map((label, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggest Labels button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuggestLabels(issue.number);
                      }}
                      className="px-3 py-1 bg-white text-sm font-medium text-blue-600 rounded-md shadow hover:bg-blue-50 transition-colors"
                    >
                      Suggest Labels
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded ${issue.state === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                      }`}>
                      {issue.state}
                    </span>
                    <span className="text-sm text-gray-600">#{issue.number}</span>
                    <a
                      href={`https://github.com/posit-dev/positron/issues/${issue.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div className="text-sm font-medium truncate relative">
                    {issue.title}
                    <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-3 rounded-lg text-xs max-w-sm -right-2 translate-x-full top-0 ml-2 z-20 shadow-lg">
                      <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-gray-900 border-b-[6px] border-b-transparent"></div>
                      <div className="font-medium mb-1">{issue.title}</div>
                      <div className="whitespace-pre-wrap">{issue.body}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {new Date(issue.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Main chat interface */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto">
              {/* Tool Demo Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">GitHub Issue Summary Tool</h2>
                  <button
                    onClick={() => setShowSystemPrompt(prev => !prev)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg
                      className={`w-4 h-4 transform transition-transform ${showSystemPrompt ? 'rotate-90' : ''
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
                    {showSystemPrompt ? 'Hide' : 'Show'} System Instructions
                  </button>
                </div>

                {showSystemPrompt && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                    <div className="font-semibold mb-2">System Instructions:</div>
                    <div className="text-gray-600 whitespace-pre-wrap prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {messages.find(m => m.role === 'system')?.content || ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {messages
                    .filter(m => m.role !== 'system')
                    .map(m => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                      >
                        <div className="text-sm prose prose-sm max-w-none">
                          {m.role === 'assistant' && (
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
                                    className={`${isInline
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
                            {m.content}
                          </ReactMarkdown>

                          {/* Tool invocations */}
                          {m.toolInvocations && m.toolInvocations.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {m.toolInvocations.map((toolInvocation) => {
                                const toolCallId = toolInvocation.toolCallId;
                                return (
                                  <div key={toolCallId} className="text-xs">
                                    <div className="text-gray-500 mb-1 flex items-center gap-2">
                                      <span>Using tool: <span className="font-medium">{toolInvocation.toolName}</span></span>
                                      {toolInvocation.args && (
                                        <span className="text-gray-400">
                                          (
                                          {Object.entries(toolInvocation.args).map(([key, value], index, arr) => (
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
                                      onClick={() => toggleToolExpansion(toolCallId)}
                                      className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
                                    >
                                      <svg
                                        className={`w-4 h-4 transform transition-transform ${expandedTools[toolCallId] ? 'rotate-90' : ''
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
                                      {expandedTools[toolCallId] ? 'Hide' : 'Show'} details
                                    </button>

                                    {expandedTools[toolCallId] && (
                                      <div className="ml-4 space-y-2">
                                        {toolInvocation.state === 'partial-call' ? (
                                          <>
                                            <div className="text-gray-500">Arguments:</div>
                                            <div className="bg-gray-50 p-2 rounded">
                                              <pre className="whitespace-pre-wrap">
                                                {JSON.stringify(toolInvocation.args, null, 2)}
                                              </pre>
                                            </div>
                                          </>
                                        ) : 'result' in toolInvocation ? (
                                          <>
                                            <div className="text-gray-500">Result:</div>
                                            <div className="bg-gray-50 p-2 rounded">
                                              <pre className="whitespace-pre-wrap">
                                                {typeof toolInvocation.result === 'string'
                                                  ? toolInvocation.result
                                                  : JSON.stringify(toolInvocation.result, null, 2)}
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
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {toolError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Error occurred</span>
                    </div>
                    <p className="text-sm text-red-600 mb-3">{toolError.message}</p>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry last message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input form at the bottom */}
          <div className="p-4 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full p-2 border border-gray-300 rounded shadow-sm"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about GitHub issues..."
                  disabled={isToolLoading}
                />
                <button
                  type="submit"
                  disabled={isToolLoading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isToolLoading ? 'Processing...' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
