import { Message, Util } from 'yamdbf';

import { BotClient } from '../client/botClient';
import { TrackCacheManager } from '../client/managers/trackCacheManager';
import { YouTube } from '../music/YouTube';
import { Search } from '../types/music/search';
import { Searches } from '../types/music/searches';
import { YouTubeVideo } from '../types/youtube/youtubeVideo';
import { Track } from './track';
import { TrackBuilder } from './trackBuilder';

/**
 * Search for tracks.
 */
export class TrackSearch {
  private _searches: Searches;
  private _trackSelectionCache: TrackCacheManager;

  get searches(): Searches {
    return this._searches;
  }

  /**
   * Creates an instance of {@link TrackSearch}.
   * @param client The bot client.
   */
  constructor(private client: BotClient) {
    this._searches = {};
    this._trackSelectionCache = new TrackCacheManager();
  }

  /**
   * Search for tracks.
   * @param message The message containing the search.
   * @param search The search terms.
   */
  async search(message: Message, search: string): Promise<void> {
    const guildId: string = message.guild.id;
    const memberId: string = message.member.id;
    const maxResults = 5;
    const tracks: Track[] = [];
    const youtube: YouTube = new YouTube(this.client);
    const msg: Message = (await message.channel.send(
      ':mag_right: Searching for videos with that name...'
    )) as Message;
    const newSearch: Search = {
      complete: false,
      msg: msg,
      terms: search,
      member: message.member,
      results: []
    };

    Util.assignNestedValue(this._searches, [guildId, memberId], newSearch);

    const cachedTracks: Track[] = this._trackSelectionCache.find(guildId, search.toLowerCase());
    if (cachedTracks) {
      newSearch.complete = true;
      newSearch.results = cachedTracks;
      Util.assignNestedValue(this._searches, [guildId, memberId], newSearch);
    } else {
      const videos: YouTubeVideo[] = await youtube.search(search, maxResults);
      await this.populate(guildId, memberId, videos);
    }
  }

  private async populate(guildId: string, memberId: string, videos: YouTubeVideo[]): Promise<void> {
    const tracks: Track[] = [];
    const search: Search = Util.getNestedValue(this._searches, [guildId, memberId]);

    for (let i = 0; i < videos.length; i++) {
      const url = `https://www.youtube.com/watch?v=${videos[i].id.videoId}`;
      const videoInfo = await this.client.musicPlayer.getVideoInfo(url);
      const track: Track = new TrackBuilder()
        .setAuthor(videoInfo.author.name)
        .setDuration(parseInt(videoInfo.length_seconds, 10))
        .setIsPlaying(false)
        .setRequestedBy(search.member)
        .setThumbail(videoInfo.thumbnail_url)
        .setTitle(videoInfo.title)
        .setUrl(url)
        .build();
      tracks.push(track);
    }

    search.complete = true;
    search.results = tracks;
    Util.assignNestedValue(this._searches, [guildId, memberId], search);
    this._trackSelectionCache.add(guildId, search.terms.toLowerCase(), tracks);
  }
}
