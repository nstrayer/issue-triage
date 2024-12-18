import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import {
    getGithubIssue,
    getRepositoryLabels,
    searchIssuesByLabels,
    setSuggestedLabels,
    setIssueStatus,
    categorizeIssueType,
    getIssueActivity,
    searchExternalContent,
    getDiscussionById
} from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: anthropic('claude-3-5-sonnet-latest'),
            messages,
            experimental_toolCallStreaming: true,
            maxSteps: 10,
            tools: {
                getGithubIssue,
                getRepositoryLabels,
                searchIssuesByLabels,
                setSuggestedLabels,
                setIssueStatus,
                categorizeIssueType,
                getIssueActivity,
                searchExternalContent,
                getDiscussionById
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in tool-demo API:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process tool demo request' }),
            { status: 500 }
        );
    }
} 