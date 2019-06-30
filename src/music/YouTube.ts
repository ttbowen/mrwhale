import * as request from 'request-promise';

import { BotClient } from '../client/botClient';
import { YouTubeVideo } from '../types/youtube/youtubeVideo';

/**
 * Manages calls to the Youtube API.
 */
export class YouTube {
  /**
   * Creates an instance of {@link YouTube}.
   * @param client The bot client.
   */
  constructor(private client: BotClient) {}

  /**
   * Search YouTube for videos.
   * @param query The search terms.
   * @param maxResults The maximum number of results to fetch.
   */
  async search(query: string, maxResults: number): Promise<YouTubeVideo[]> {
    const searchoptions = {
      url: 'https://www.googleapis.com/youtube/v3/search',
      qs: {
        key: await this.client.storage.get('youtube_api'),
        type: 'video',
        q: query,
        part: 'snippet',
        regionCode: 'GB',
        maxResults: maxResults
      },
      json: true
    };

    return request(searchoptions).then(body => {
      if (body.items) {
        const items: YouTubeVideo[] = body.items;
        return items;
      }
    });
  }
}
