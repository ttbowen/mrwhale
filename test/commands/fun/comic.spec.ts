import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../../src/commands/fun/comic';
import { loadFixtures } from '../../helpers/loadFixtures';

const request = require('request-promise');
const expect = chai.expect;
chai.use(sinonChai);

describe('comic', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;
    let requestStub: sinon.SinonStub;
    let clientStub: any;
    let textChannelStub: any;
    let fixtures: any;

    before(() => {
        fixtures = loadFixtures(path.join(__dirname, '../../fixtures/comic'), 'utf8');
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        sandbox.stub(Math, 'random').callsFake(() => 0.09121145093071314);
    });

    beforeEach(() => {
        clientStub = sinon.createStubInstance(Client);
        textChannelStub = sinon.createStubInstance(TextChannel);
    });

    after(() => sandbox.restore());

    afterEach(() => requestStub.restore());

    it('should respond with a random comic when no author is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.cah);

        await cmd.action(message, ['']);

        expect(message.channel.send).calledWith('http://files.explosm.net/comics/Kris/steak.png');
    });

    it('should respond with a random cah comic when "cah" is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.cah);

        await cmd.action(message, ['cah']);

        expect(message.channel.send).calledWith('http://files.explosm.net/comics/Kris/steak.png');
    });

    it('should respond with a random xkcd comic when "xkcd" is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.xkcd);

        await cmd.action(message, ['xkcd']);

        expect(message.channel.send).calledWith(
            'https://imgs.xkcd.com/comics/smart_home_security.png'
        );
    });

    it('should respond with a random xkcd comic when "xkcd" is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.xkcd);

        await cmd.action(message, ['xkcd']);

        expect(message.channel.send).calledWith(
            'https://imgs.xkcd.com/comics/smart_home_security.png'
        );
    });

    it('should respond with a random smbc comic when "smbc" is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.smbc);

        await cmd.action(message, ['smbc']);

        expect(message.channel.send).calledWith('http://www.smbc-comics.com/comics/20101112.gif');
    });

    it('should respond with a random oatmeal comic when "oatmeal" is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.theoatmeal);

        await cmd.action(message, ['theoatmeal']);

        expect(message.channel.send).calledWith(
            'http://s3.amazonaws.com/theoatmeal-img/comics/thanksgiving/header.png'
        );
    });

    it('should respond with a random oatmeal comic when "random" is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub = sandbox.stub(request, 'Request');
        requestStub.resolves(fixtures.cah);

        await cmd.action(message, ['random']);

        expect(message.channel.send).calledWith('http://files.explosm.net/comics/Kris/steak.png');
    });
});
