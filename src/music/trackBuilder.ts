import { GuildMember } from 'discord.js';

import { Track } from './track';

/**
 * Builds a new {@link Track}.
 */
export class TrackBuilder {
  private _author: string;
  private _duration: number;
  private _isPlaying: boolean;
  private _requestedBy: GuildMember;
  private _thumbnail: string;
  private _title: string;
  private _url: string;

  get author(): string {
    return this._author;
  }

  get duration(): number {
    return this._duration;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get requestedBy(): GuildMember {
    return this._requestedBy;
  }

  get thumbnail(): string {
    return this._thumbnail;
  }

  get title(): string {
    return this._title;
  }

  get url(): string {
    return this._url;
  }

  /**
   * Set the video author.
   * @param value The author of the track.
   */
  setAuthor(value: string): TrackBuilder {
    this._author = value;
    return this;
  }

  /**
   * Set the video duration.
   * @param value The video duration in seconds.
   */
  setDuration(value: number): TrackBuilder {
    this._duration = value;
    return this;
  }

  /**
   * Set whether the track is playing.
   * @param value Whether the track is playing.
   */
  setIsPlaying(value: boolean): TrackBuilder {
    this._isPlaying = value;
    return this;
  }

  /**
   * Set guild member who requested the track.
   * @param value The guild member who requested the track.
   */
  setRequestedBy(value: GuildMember): TrackBuilder {
    this._requestedBy = value;
    return this;
  }

  /**
   * Set the video thumbnail.
   * @param value The video thumbnail.
   */
  setThumbail(value: string): TrackBuilder {
    this._thumbnail = value;
    return this;
  }

  /**
   * Set the video title.
   * @param value The video title.
   */
  setTitle(value: string): TrackBuilder {
    this._title = value;
    return this;
  }

  /**
   * Set the video Url.
   * @param value The video url.
   */
  setUrl(value: string): TrackBuilder {
    this._url = value;
    return this;
  }

  /**
   * Build and return the new track.
   */
  build(): Track {
    return new Track(this);
  }
}
