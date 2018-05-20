import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message, Time } from 'yamdbf';

import * as command from '../../src/commands/info/uptime';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('uptime', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        clientStub.readyAt = new Date();
        cmd.client = clientStub;
    });

    after(() => sandbox.restore());

    it('should respond with bot uptime', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        console.log(cmd.client.uptime);
        const uptime: string = Time.difference(clientStub.uptime * 2, clientStub.uptime).toString();

        cmd.action(message);

        expect(message.channel.send).calledWith(`I have been up ${uptime}`);
    });
});
