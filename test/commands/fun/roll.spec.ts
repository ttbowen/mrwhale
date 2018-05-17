import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../../src/commands/fun/roll';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('roll', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(() => 0.09121145093071314);
    });

    after(() => sandbox.restore());

    it('should roll random dice value', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, []);

        expect(message.channel.send).calledWith(`You rolled a 1`);
    });

    it('should roll random dice value within range of passed number', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, ['50']);

        expect(message.channel.send).calledWith(`You rolled a 5`);
    });

    it('should roll the correct number of dice', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, ['5 d10']);

        expect(message.channel.send).calledWith(`You rolled a 1,1,1,1,1`);
    });
});
