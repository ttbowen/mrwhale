import * as chai from 'chai';
import { TextChannel, User } from 'discord.js';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message, StorageFactory } from 'yamdbf';

const mock = require('mock-require');
mock('../../config.json');

import { BotClient } from '../../src/client/botClient';
import * as command from '../../src/commands/fun/meme';
import * as memes from '../../src/data/memes';
import { loadFixtures } from '../helpers/loadFixtures';
import { TestProviders } from '../testProviders';

const request = require('request-promise');
const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(BotClient);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('meme', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;
    let requestStub: sinon.SinonStub;
    let fixtures: any;

    before(() => {
        fixtures = loadFixtures(path.join(__dirname, '../fixtures/meme'), 'utf8');
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        requestStub = sandbox.stub(request, 'post');

        clientStub.provider = TestProviders.TestStorageProvider();
        const storageFactory: StorageFactory = new StorageFactory(
            clientStub,
            new clientStub.provider('guild_storage'),
            new clientStub.provider('guild_settings')
        );
        clientStub.storage = storageFactory.createClientStorage();
        clientStub.storage.set('imgflip_user', 'mrwhale');
        clientStub.storage.set('imgflip_pass', 'P@ssw@rd123');

        cmd.client = clientStub;
    });

    after(() => sandbox.restore());

    it('should respond with the requested meme url', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        const body = JSON.parse(fixtures.meme);
        requestStub.resolves(fixtures.meme);

        await cmd.action(message, ['onedoesnot', 'top', 'bottom']);

        expect(message.channel.send).calledWith(body.data.url);
    });

    it('should respond with an error message if an error occured', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        const body = JSON.parse(fixtures.meme_error);
        requestStub.resolves(fixtures.meme_error);

        await cmd.action(message, ['onedoesnot', 'top', 'bottom']);

        expect(message.channel.send).calledWith(body.error_message);
    });

    it('should call the correct api endpoint with the correct data', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        const memeName = 'onedoesnot';
        const top = 'one does not';
        const bottom = 'simply test meme';
        const data = {
            template_id: memes.default[memeName],
            username: await clientStub.storage.get('imgflip_user'),
            password: await clientStub.storage.get('imgflip_pass'),
            text0: top,
            text1: bottom
        };
        requestStub.resolves(fixtures.meme);

        await cmd.action(message, [memeName, top, bottom]);

        expect(requestStub).calledWith('https://api.imgflip.com/caption_image', { form: data });
    });

    it('should respond a list of commands when list is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub.resolves(fixtures.meme);
        message.author = sinon.createStubInstance(User);
        sandbox.stub(message, 'reply');
        let list = '';
        for (const meme in memes.default) {
            list += `${meme}\n`;
        }

        await cmd.action(message, ['list', '', '']);

        expect(message.author.send).calledWith({
            embed: { title: 'All available memes', description: list }
        });
        expect(message.reply).calledWith('Sent you a DM with list of available memes.');
    });
});
