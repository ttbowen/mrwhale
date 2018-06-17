import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'rockpaper',
            desc: 'Rock. Paper. Scissors.',
            usage: '<prefix>rockpaper <rock|paper|scissors>',
            aliases: ['rps'],
            group: 'games'
        });
    }

    private compare(first: string, second: string): string {
        if (first === second) {
            return 'It\'s a tie!';
        } else if (first === 'scissors') {
            if (second === 'paper') return 'Scissors wins! :v:';
            else return 'Rock wins! :fist:';
        } else if (first === 'rock') {
            if (second === 'scissors') return 'Rock wins! :fist:';
            else return 'Paper wins! :raised_hand:';
        } else if (first === 'paper') {
            if (second === 'rock') return 'Paper wins! :raised_hand:';
            else return 'Scissors wins! :v:';
        }
    }

    async action(message: Message, [choice]: [string]): Promise<any> {
        if (!choice || choice === '') return message.channel.send(`Please pass a choice.`);

        const userChoice: string = choice.trim().toLowerCase();
        const compChoice: number = Math.random();
        let compChoiceStr = '';

        const validChoices: RegExp = /\b(rock|paper|scissors)\b/;

        if (!message.content.match(validChoices))
            return message.channel.send('Please pass rock, paper, scissors.');

        const rockVal = 0.34;
        if (compChoice < 0.34) {
            compChoiceStr = 'rock';
        } else if (compChoice <= 0.67) {
            compChoiceStr = 'paper';
        } else {
            compChoiceStr = 'scissors';
        }
        const result: string = this.compare(userChoice, compChoiceStr);

        return message.channel.send(`${compChoiceStr}. ${result}`);
    }
}
