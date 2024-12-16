export interface Tool {
  name: string;
  description: string;
  execute: () => void;
}

export interface SuggestedLabels {
  [issueNumber: number]: string[];
}

export interface GithubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface ExpandedTools {
  [messageId: string]: boolean;
}

export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  state?: string;
  result?: string | Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  toolInvocations?: ToolInvocation[];
} 