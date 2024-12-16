import { NextResponse } from 'next/server';
import { githubService } from '@/app/services/github';

export async function POST(req: Request) {
    try {
        const { issueNumber, labels } = await req.json();
        await githubService.applyLabels(issueNumber, labels);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error applying labels:', error);
        return NextResponse.json(
            { error: 'Failed to apply labels' },
            { status: 500 }
        );
    }
} 