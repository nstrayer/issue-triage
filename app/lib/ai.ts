import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Processes a labeling request through OpenAI
 * @param prompt The labeling prompt to send to the AI
 */
export async function processLabelingRequest(prompt: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that suggests GitHub issue labels based on issue content. Be concise and accurate in your suggestions.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            stream: false, // Changed to false since we're not using streaming
        });

        return NextResponse.json(response.choices[0].message);
    } catch (error) {
        console.error('Error processing AI request:', error);
        return NextResponse.json(
            { error: 'Failed to process AI request' },
            { status: 500 }
        );
    }
} 