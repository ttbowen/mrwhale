import { YouTubeThumbnail } from './youtubeThumbnail';

export type YouTubeSnippet = {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default?: YouTubeThumbnail;
        medium?: YouTubeThumbnail;
        high?: YouTubeThumbnail;
        standard?: YouTubeThumbnail;
        maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
};
