import { z } from 'zod';
import { SearchExternalContentArgs } from '@/app/types/tools';

/**
 * Tool for searching external content using Brave Search API
 */
export const searchExternalContent = {
    description: 'Search for additional context and information using Brave Search. Returns web search results and optional AI summaries.',
    parameters: z.object({
        query: z.string().describe('The search query to look up'),
        country: z.string().optional().default('us').describe('The search query country (2-letter code)'),
        search_lang: z.string().optional().default('en').describe('The search language preference'),
        result_filter: z.array(z.string()).optional().describe('Types of results to include (web, news, discussions)'),
        summary: z.boolean().optional().default(true).describe('Whether to include an AI summary of results')
    }),
    execute: async ({ query, country, search_lang, result_filter, summary }: SearchExternalContentArgs) => {
        try {
            // Initial web search request
            const params: Record<string, string> = {
                q: query,
                summary: summary ? '1' : '0'
            };
            
            if (country) params.country = country;
            if (search_lang) params.search_lang = search_lang;
            if (result_filter?.length) params.result_filter = result_filter.join(',');

            const searchParams = new URLSearchParams(params);

            const searchResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?${searchParams}`, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
                },
                method: 'GET',
                cache: 'no-store',
            });

            if (!searchResponse.ok) {
                throw new Error(`Brave Search API error: ${searchResponse.statusText}`);
            }

            const searchData = await searchResponse.json();

            // If summary is requested and available, fetch it
            if (summary && searchData.summarizer?.key) {
                const summaryParams = new URLSearchParams({
                    key: searchData.summarizer.key,
                    entity_info: '1'
                });

                const summaryResponse = await fetch(`https://api.search.brave.com/res/v1/summarizer/search?${summaryParams}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip',
                        'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
                    },
                    method: 'GET',
                    cache: 'no-store',
                });

                if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json();
                    return {
                        webResults: searchData.web?.results || [],
                        summary: summaryData.summary || null,
                        entities: summaryData.entities || []
                    };
                }
            }

            // Return just web results if no summary available
            return {
                webResults: searchData.web?.results || [],
                summary: null,
                entities: []
            };

        } catch (error) {
            console.error('Error searching external content:', error);
            return {
                error: error instanceof Error ? error.message : 'Failed to search external content',
                webResults: [],
                summary: null,
                entities: []
            };
        }
    }
}; 