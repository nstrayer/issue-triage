import { NextResponse } from 'next/server';
import { githubService } from '@/app/services/github';

export async function GET() {
    try {
        const issues = await githubService.fetchIssues();

        return NextResponse.json({
            total: issues.length,
            issues,
        });
    } catch (error) {
        console.error('Error fetching GitHub issues:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub issues' },
            { status: 500 }
        );
    }
} 