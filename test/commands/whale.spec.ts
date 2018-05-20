import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../src/commands/fun/whale';
import * as eyes from '../../src/data/eyes';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('whale', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(() => 0.09121145093071314);
    });

    after(() => sandbox.restore());

    it('should respond with a whale face matching specified length', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        const size = 10;
        let whale = eyes.default[4][0];
        for (let i = 0; i < size; i++) {
            whale += '\\_';
        }
        whale += eyes.default[4][1];

        cmd.action(message, [`x${size}`]);

        expect(message.channel.send).calledWith(whale);
    });

    it('should respond to let the user know when  the input is too small', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, ['x4']);

        expect(message.channel.send).calledWith('You call that a whale?');
    });

    it('should respond to let the user know when  the input is too large', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        cmd.action(message, ['x51']);

        expect(message.channel.send).calledWith(
            'I Know whales are huge, but this whale is too huge for me.'
        );
    });
});
