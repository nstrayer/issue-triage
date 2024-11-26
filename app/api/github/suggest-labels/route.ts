import { processLabelingRequest } from '@/app/lib/ai';

export async function POST(req: Request) {
    const { prompt } = await req.json();
    return processLabelingRequest(prompt);
} 