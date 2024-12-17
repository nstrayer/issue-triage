import { useState, useEffect } from 'react';
import { GithubIssue, GitHubLabel } from '../types/chat';

interface UseIssuesWithoutStatusReturn {
    issues: GithubIssue[] | undefined;
    labels: GitHubLabel[] | null;
    total: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage GitHub issues without status labels
 * @returns Object containing issues data, labels, loading state, error state, and refetch function
 */
export function useIssuesWithoutStatus(): UseIssuesWithoutStatusReturn {
    const [issues, setIssues] = useState<GithubIssue[] | undefined>(undefined);
    const [labels, setLabels] = useState<GitHubLabel[] | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch both issues and labels in parallel
            const [issuesResponse, labelsResponse] = await Promise.all([
                fetch('/api/github/issues-without-status'),
                fetch('/api/github/labels')
            ]);

            if (!issuesResponse.ok || !labelsResponse.ok) {
                throw new Error('Failed to fetch GitHub data');
            }

            const [issuesData, labelsData] = await Promise.all([
                issuesResponse.json(),
                labelsResponse.json()
            ]);

            if ('error' in issuesData || 'error' in labelsData) {
                throw new Error('Failed to fetch GitHub data');
            }

            setIssues(issuesData.issues);
            setLabels(labelsData);
            setTotal(issuesData.total);
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
        issues,
        labels,
        total,
        isLoading,
        error,
        refetch: fetchData
    };
} 