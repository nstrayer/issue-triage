import { NextResponse } from 'next/server';
import { githubService } from '@/app/services/github';

export async function GET() {
    try {
        const labels = await githubService.fetchLabels();
        return NextResponse.json(labels);
    } catch (error) {
        console.error('Error fetching GitHub labels:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub labels' },
            { status: 500 }
        );
    }
} 