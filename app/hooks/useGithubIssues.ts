import { useState, useEffect } from 'react';
import { GitHubData } from '../services/github';

/**
 * Custom hook to fetch and manage unlabeled GitHub issues
 * @returns Object containing unlabeled GitHub issues data, loading state, and error state
 */
export function useGithubIssues() {
    const [githubData, setGithubData] = useState<GitHubData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [issuesResponse, labelsResponse] = await Promise.all([
                    fetch('/api/github/issues'),
                    fetch('/api/github/labels')
                ]);

                if (!issuesResponse.ok || !labelsResponse.ok) {
                    throw new Error('Failed to fetch GitHub issues or labels');
                }

                const issuesData = await issuesResponse.json();
                const labelsData = await labelsResponse.json();

                if ('error' in issuesData || 'error' in labelsData) {
                    throw new Error('Failed to fetch GitHub issues or labels');
                }

                // Filter for unlabeled issues only
                const unlabeledIssues = issuesData.issues.filter((issue: GitHubData['issues'][0]) =>
                    issue.labels.length === 0
                );

                setGithubData({
                    total: unlabeledIssues.length,
                    issues: unlabeledIssues,
                    labels: labelsData
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        githubData,
        isLoading,
        error,
    };
} 