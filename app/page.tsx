'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { SetSuggestedLabelsArgs } from './types/tools';
import { SuggestedLabels, ExpandedTools, GithubIssue } from './types/chat';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { SystemPrompt } from './components/SystemPrompt';
import { getSystemPrompt } from './config/systemPrompt';
import { useIssuesWithoutStatus } from './hooks/useIssuesWithoutStatus';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export default function Chat() {
  const {
    issues,
    labels,
    isLoading: isLoadingGithub,
    error: githubError,
  } = useIssuesWithoutStatus();

  const [suggestedLabels, setSuggestedLabels] = useState<SuggestedLabels>({});
  const [expandedTools, setExpandedTools] = useState<ExpandedTools>({});
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [isApplyingLabels, setIsApplyingLabels] = useState(false);
  
  // Get the system prompt using the configuration function
  const systemPrompt = getSystemPrompt(labels?.map(label => label.name) || []);

  const {
    messages,
    input,
    append: addMessage,
    handleInputChange,
    handleSubmit,
    isLoading: isToolLoading,
    error: toolError,
    reload,
  } = useChat({
    api: '/api/tool-demo',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: systemPrompt,
      }
    ],
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'setSuggestedLabels') {
        const { issueNumber, suggestedLabels: labels } = toolCall.args as SetSuggestedLabelsArgs;
        setSuggestedLabels(prev => ({
          ...prev,
          [issueNumber]: labels
        }));

        // Return the tool call result
        const result = await fetch('/api/github/apply-labels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ issueNumber, labels }),
        });

        if (!result.ok) {
          const error = await result.json();
          return {
            success: false,
            message: error.message || 'Failed to apply labels'
          };
        }

        return {
          success: true,
          message: `Successfully applied ${labels.length} labels to issue #${issueNumber}: ${labels.join(', ')}`
        };
      }
    },
  });

  // Toggle function for expanding/collapsing tool results
  const toggleToolExpansion = (messageId: string) => {
    setExpandedTools(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Function to handle suggesting actions for an issue or discussion
  const handleSuggestActions = (itemId: number | string) => {
    // If itemId is a number, it's an issue number
    if (typeof itemId === 'number') {
      addMessage({
        role: 'user',
        content: `Please analyze issue #${itemId} and suggest appropriate actions for triage`
      });
    } 
    // If itemId is a string, it's a discussion ID
    else {
      addMessage({
        role: 'user',
        content: `Please analyze discussion with ID ${itemId} and suggest appropriate actions`
      });
    }
  };

  // Function to handle applying labels to an issue
  const handleApplyLabels = async (issueNumber: number, labels: string[]) => {
    try {
      setIsApplyingLabels(true);
      const response = await fetch('/api/github/apply-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueNumber, labels }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply labels');
      }

      // Clear suggested labels for this issue after successful application
      setSuggestedLabels(prev => {
        const newLabels = { ...prev };
        delete newLabels[issueNumber];
        return newLabels;
      });

      // Refresh the issues list
      window.location.reload();
    } catch (error) {
      console.error('Error applying labels:', error);
      alert('Failed to apply labels. Please try again.');
    } finally {
      setIsApplyingLabels(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Title bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">Positron Intake Assistant</h1>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm text-gray-500">AI-powered issue triage</span>
        </div>
      </header>

      {/* Main content with padding for title bar */}
      <div className="flex w-full pt-14">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full bg-white">
              <Sidebar
                isLoadingGithub={isLoadingGithub}
                githubError={githubError}
                issues={issues}
                suggestedLabels={suggestedLabels}
                onSuggestActions={handleSuggestActions}
                onApplyLabels={handleApplyLabels}
                isApplyingLabels={isApplyingLabels}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-gray-100 w-px" />
          
          <ResizablePanel defaultSize={65}>
            {/* Main chat interface */}
            <main className="flex-1 flex flex-col h-full bg-white">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                  {/* System Prompt */}
                  <SystemPrompt
                    content={messages.find(m => m.role === 'system')?.content || ''}
                    isVisible={showSystemPrompt}
                    onToggleVisibility={() => setShowSystemPrompt(prev => !prev)}
                  />

                  {/* Messages */}
                  <div className="mt-6 space-y-6">
                    {messages
                      .filter(m => m.role !== 'system')
                      .map(message => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          expandedTools={expandedTools}
                          onToggleToolExpansion={toggleToolExpansion}
                        />
                      ))}
                  </div>

                  {/* Error Display */}
                  {toolError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Error occurred</span>
                      </div>
                      <p className="text-sm text-red-600 mb-3">{toolError.message}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          reload();
                        }}
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

              {/* Input Form */}
              <div className="border-t border-gray-100 bg-white">
                <ChatInput
                  input={input}
                  isLoading={isToolLoading}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
              </div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
