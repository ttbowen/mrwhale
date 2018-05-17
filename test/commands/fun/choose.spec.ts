import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../../src/commands/fun/choose';
import * as responses from '../../../src/data/choose';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('choose', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(() => 0.09121145093071314);
    });

    after(() => sandbox.restore());

    it('should ask the user to pass in options when no options are passed', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, null);

        expect(message.channel.send).calledWith(`No choices have been passed.`);
    });

    it('should ask the user to pass more options when less than 2 options are passed', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, ['whale']);

        expect(message.channel.send).calledWith(`Please pass two or more choices.`);
    });

    it('should choose one of the options', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, ['whale', 'dolphin']);

        expect(message.channel.send).calledWith(
            `${responses.default[1].replace(/<<CHOICE>>/g, 'whale')}`
        );
    });
});
