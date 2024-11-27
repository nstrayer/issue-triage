import { useState, useEffect } from 'react';

/**
 * Type definition for GitHub issues data
 */
interface GitHubData {
    total: number;
    issues: Array<{
        number: number;
        title: string;
        state: string;
        created_at: string;
        body: string;
        labels: Array<{
            name: string;
            color: string;
        }>;
        pull_request?: {
            url: string;
        };
    }>;
}

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
                const response = await fetch('/api/github/issues');

                if (!response.ok) {
                    throw new Error('Failed to fetch GitHub issues');
                }

                const issuesData = await response.json();

                if ('error' in issuesData) {
                    throw new Error(issuesData.error);
                }

                // Filter for unlabeled issues only
                const unlabeledIssues = issuesData.issues.filter((issue: GitHubData['issues'][0]) =>
                    issue.labels.length === 0
                )

                setGithubData({
                    total: unlabeledIssues.length,
                    issues: unlabeledIssues
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