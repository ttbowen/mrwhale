import * as request from 'request-promise';
import { BotClient } from '../client/botClient';

/**
 * Manages the Youtube API.
 */
export class YouTube {
    constructor(private client: BotClient) {}

    /**
     * Search YouTube for a video.
     * @param query Search terms.
     */
    async search(query: string): Promise<any> {
        const searchoptions = {
            url: 'https://www.googleapis.com/youtube/v3/search',
            qs: {
                key: await this.client.storage.get('youtube_api'),
                type: 'video',
                q: query,
                part: 'snippet',
                regionCode: 'GB',
                maxResults: '1'
            },
            json: true
        };

        return request(searchoptions);
    }
}
