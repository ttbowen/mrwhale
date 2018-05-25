import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../src/commands/fun/conchshell';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('conchshell', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(() => 0.09121145093071314);
    });

    after(() => sandbox.restore());

    it('should respond with a random answer when called', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        message.content = 'magicconch Is this a good test?';

        cmd.action(message);

        expect(message.channel.send).calledWith(`:shell: I don't think so.`);
    });

    it('should respond with fixed answers to specific questions', () => {
        const firstMsg: Message = new Message(textChannelStub, null, clientStub);
        const secondMsg: Message = new Message(textChannelStub, null, clientStub);
        firstMsg.content = 'magicconch Will I ever get married?';
        secondMsg.content = 'magicconch What should we do to get out of the kelp forest?';

        cmd.action(firstMsg);
        cmd.action(secondMsg);

        expect(firstMsg.channel.send).calledWith(`:shell: Maybe someday.`);
        expect(secondMsg.channel.send).calledWith(`:shell: Nothing.`);
    });
});
