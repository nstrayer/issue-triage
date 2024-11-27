import { Octokit } from '@octokit/rest';

export const getGitHubClient = () => new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export const REPO_OWNER = 'posit-dev';
export const REPO_NAME = 'positron'; 