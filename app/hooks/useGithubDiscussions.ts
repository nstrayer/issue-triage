import { useState, useEffect } from 'react';
import { GithubDiscussion } from '../types/chat';

interface UseGithubDiscussionsReturn {
    discussions: GithubDiscussion[] | undefined;
    total: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage GitHub discussions
 * @returns Object containing discussions data, loading state, error state, and refetch function
 */
export function useGithubDiscussions(): UseGithubDiscussionsReturn {
    const [discussions, setDiscussions] = useState<GithubDiscussion[] | undefined>(undefined);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/github/discussions');

            if (!response.ok) {
                throw new Error('Failed to fetch GitHub discussions');
            }

            const data = await response.json();

            if ('error' in data) {
                throw new Error('Failed to fetch GitHub discussions');
            }

            setDiscussions(data.discussions);
            setTotal(data.total);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    return {
        discussions,
        total,
        isLoading,
        error,
        refetch: fetchData
    };
} 