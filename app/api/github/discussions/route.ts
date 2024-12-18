import { NextResponse } from 'next/server';
import { githubService } from '@/app/services/github';

export async function GET() {
    try {
        const { discussions, totalCount } = await githubService.fetchDiscussions(20);

        return NextResponse.json({
            total: totalCount,
            discussions,
        });
    } catch (error) {
        console.error('Error fetching GitHub discussions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub discussions' },
            { status: 500 }
        );
    }
} 