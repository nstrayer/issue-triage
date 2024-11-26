import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

interface GitHubLabel {
    name: string;
    color: string;
    description: string | null;
}

export async function GET() {
    try {
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });

        const response = await octokit.issues.listLabelsForRepo({
            owner: 'posit-dev',
            repo: 'positron',
        });

        const labels = response.data.map(label => ({
            name: label.name,
            color: label.color,
            description: label.description,
        }));

        return NextResponse.json(labels);
    } catch (error) {
        console.error('Error fetching GitHub labels:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub labels' },
            { status: 500 }
        );
    }
} 