import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

import * as fs from 'fs';
import * as path from 'path';
import * as seedrandom from 'seedrandom';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'gameidea',
      desc: 'Get a random game idea.',
      usage: '<prefix>gameidea',
      group: 'useful'
    });
    this.setSeed();
  }
  private rng: seedrandom.prng;
  private ideaData: any;

  private setSeed(): void {
    this.rng = seedrandom();
  }

  private async loadGenres(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../../data/static/genres.json'), 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  async action(message: Message, args: string[]): Promise<any> {
    this.ideaData = await this.loadGenres();

    const genres: any = this.ideaData.genres[0];

    const name: string = genres.name[Math.floor(this.rng() * genres.name.length)];
    const action: string = genres.actions[Math.floor(this.rng() * genres.actions.length)];
    const item: string = genres.items[Math.floor(this.rng() * genres.items.length)];
    const location: string = genres.locations[Math.floor(this.rng() * genres.locations.length)];
    const goal: string = genres.goals[Math.floor(this.rng() * genres.goals.length)];

    return message.channel.send(`A ${name} game, where you ${action} ${item} ${location} ${goal}`);
  }
}
