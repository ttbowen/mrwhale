import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../../src/commands/fun/8ball';
import * as responses from '../../../src/data/8ball';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('8ball', () => {
    const cmd: command.default = new command.default();

    it('should respond with one of the predefined answers when called', () => {
        const message: Message = new Message(textChannelStub, null, null);
        message.content = '8ball Is this a good test?';
        sinon.stub(Math, 'random').returns(0);

        cmd.action(message);

        expect(message.channel.send).calledWith(`:8ball: ${responses.default[0]}`);
    });

    it('should respond with correct responses with specific questions', () => {
        const firstMsg: Message = new Message(textChannelStub, null, null);
        const secondMsg: Message = new Message(textChannelStub, null, null);
        firstMsg.content = 'magicconch Will I ever get married?';
        secondMsg.content = 'magicconch What should we do to get out of the kelp forest.';

        cmd.action(firstMsg);
        cmd.action(secondMsg);

        expect(firstMsg.channel.send).calledWith(`:shell: Maybe someday.`);
        expect(secondMsg.channel.send).calledWith(`:shell: Nothing.`);
    });

    it('should respond with conchshell overrides when called with aliases', () => {
        const message: Message = new Message(textChannelStub, null, null);
        message.content = 'conchshell Is this a good test.';

        cmd.action(message);

        expect(message.channel.send).calledWith(`:shell: I don't think so.`);
    });
});
