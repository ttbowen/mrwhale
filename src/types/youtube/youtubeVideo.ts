import { YouTubeId } from './youtubeId';
import { YouTubeSnippet } from './youtubeSnippet';

export type YouTubeVideo = {
  kind: string;
  etag: string;
  id: YouTubeId;
  snippet: YouTubeSnippet;
};
