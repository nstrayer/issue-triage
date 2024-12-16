import { z } from 'zod';
import { GetIssueActivityArgs } from '@/app/types/tools';
import { getGitHubClient } from '../github-client';

interface TimelineEvent {
    date: string;
    type: string;
    actor: string;
    details: string;
}

/**
 * Helper function to get human-readable details for timeline events
 */
function getEventDetails(event: any): string {
    switch (event.event) {
        case 'labeled':
            return `Added label: ${event.label?.name}`;
        case 'unlabeled':
            return `Removed label: ${event.label?.name}`;
        case 'assigned':
            return `Assigned to ${event.assignee?.login}`;
        case 'unassigned':
            return `Unassigned from ${event.assignee?.login}`;
        case 'commented':
            return 'Added a comment';
        case 'closed':
            return `Closed${event.state_reason ? ` as ${event.state_reason}` : ''}`;
        case 'reopened':
            return 'Reopened';
        case 'referenced':
            return `Referenced in ${event.commit_id || 'another item'}`;
        default:
            return event.event || 'Unknown activity';
    }
}

export const getIssueActivity = {
    description: 'Retrieves and analyzes recent activity on a GitHub issue',
    parameters: z.object({
        issueNumber: z.number().describe('The GitHub issue to analyze'),
        lookbackPeriod: z.number().optional().describe('Number of days to analyze, default 30')
    }),
    execute: async ({ issueNumber, lookbackPeriod = 30 }: GetIssueActivityArgs) => {
        try {
            const octokit = getGitHubClient();

            // Get issue details and timeline
            const [issueResponse, timelineResponse] = await Promise.all([
                octokit.rest.issues.get({
                    owner: process.env.GITHUB_REPOSITORY_OWNER!,
                    repo: process.env.GITHUB_REPOSITORY_NAME!,
                    issue_number: issueNumber,
                }),
                octokit.rest.issues.listEventsForTimeline({
                    owner: process.env.GITHUB_REPOSITORY_OWNER!,
                    repo: process.env.GITHUB_REPOSITORY_NAME!,
                    issue_number: issueNumber,
                }),
            ]);

            const issue = issueResponse.data;
            const timeline = timelineResponse.data;

            // Calculate the lookback date
            const lookbackDate = new Date();
            lookbackDate.setDate(lookbackDate.getDate() - lookbackPeriod);

            // Process timeline events
            const activityTimeline: TimelineEvent[] = timeline
                .filter(event => {
                    const createdAt = 'created_at' in event ? event.created_at :
                        'author' in event ? event.author.date : null;
                    return createdAt && new Date(createdAt) >= lookbackDate;
                })
                .map(event => ({
                    date: 'created_at' in event ? event.created_at! :
                        'author' in event ? event.author.date : new Date().toISOString(),
                    type: 'event' in event ? event.event! : 'commit',
                    actor: 'actor' in event && event.actor ? event.actor.login :
                        'author' in event ? event.author.name : 'unknown',
                    details: getEventDetails(event),
                }));

            // Calculate metrics
            const lastUpdateDate = issue.updated_at;
            const daysSinceLastUpdate = Math.floor(
                (new Date().getTime() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            // Get unique participants
            const participants = new Set<string>();
            activityTimeline.forEach(event => participants.add(event.actor));
            participants.add(issue.user?.login || 'unknown');

            // Check if issue needs attention
            const hasInfoNeededLabel = issue.labels.some(
                label => typeof label === 'object' && label.name?.toLowerCase().includes('info needed')
            );
            
            const needsAttention = 
                daysSinceLastUpdate > 7 || // Inactive for more than a week
                hasInfoNeededLabel || // Has 'info needed' label
                activityTimeline.length === 0; // No recent activity

            // Generate attention reason
            let attentionReason = '';
            if (daysSinceLastUpdate > 7) {
                attentionReason = `Issue has been inactive for ${daysSinceLastUpdate} days`;
            } else if (hasInfoNeededLabel) {
                attentionReason = 'Issue is waiting for more information';
            } else if (activityTimeline.length === 0) {
                attentionReason = 'No recent activity in the specified timeframe';
            }

            return {
                lastUpdateDate,
                daysSinceLastUpdate,
                participantCount: participants.size,
                activityTimeline,
                needsAttention,
                attentionReason,
            };
        } catch (error) {
            console.error('Error getting issue activity:', error);
            return {
                lastUpdateDate: null,
                daysSinceLastUpdate: null,
                participantCount: 0,
                activityTimeline: [],
                needsAttention: true,
                attentionReason: `Error retrieving activity: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
}; 