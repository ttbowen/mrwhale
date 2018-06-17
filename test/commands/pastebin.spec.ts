import * as chai from 'chai';
import { TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message, StorageFactory } from 'yamdbf';

const mock = require('mock-require');
mock('../../config.json');

import { BotClient } from '../../src/client/botClient';
import * as command from '../../src/commands/useful/pastebin';
import { TestProviders } from '../testProviders';

const request = require('request-promise');
const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(BotClient);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('pastebin', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;
    let requestStub: sinon.SinonStub;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        requestStub = sandbox.stub(request, 'Request');

        clientStub.provider = TestProviders.TestStorageProvider();
        const storageFactory: StorageFactory = new StorageFactory(
            clientStub,
            new clientStub.provider('guild_storage'),
            new clientStub.provider('guild_settings')
        );
        clientStub.storage = storageFactory.createClientStorage();
        clientStub.storage.set('pastebin', 'abcdefghijklmnopqrstuvwxyz123456789');

        cmd.client = clientStub;
    });

    after(() => sandbox.restore());

    it('should respond with a pastebin url', async () => {
        const paste = 'This is a paste';
        const expected = 'https://pastebin.com/DcmTX479';
        const message: Message = new Message(textChannelStub, null, clientStub);
        requestStub.resolves(expected);

        await cmd.action(message, [paste]);

        expect(message.channel.send).calledWith(expected);
    });

    it('should call the api with the correct options', async () => {
        const paste = 'This is a paste';
        const expected = 'https://pastebin.com/DcmTX479';
        const message: Message = new Message(textChannelStub, null, clientStub);
        const options = {
            callback: undefined,
            url: `https://pastebin.com/api/api_post.php`,
            method: 'POST',
            form: {
                api_option: 'paste',
                api_paste_code: paste,
                api_dev_key: await cmd.client.storage.get('pastebin')
            }
        };
        requestStub.resolves(expected);

        await cmd.action(message, [paste]);

        expect(requestStub).calledWith(options);
    });

    it('should ask the user to provide a paste is none is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);

        await cmd.action(message, ['']);

        expect(message.channel.send).calledWith('Please provide a paste to upload.');
    });
});
