import * as chai from 'chai';
import { Client, RichEmbed, TextChannel, User } from 'discord.js';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { createConnection, Connection } from 'typeorm';
import { Guild, Message } from 'yamdbf';

import * as command from '../../src/commands/useful/define';
import { Database } from '../../src/database/database';
import { Dictionary } from '../../src/entity/dictionary';
import * as BotUser from '../../src/entity/user';
import { UserExpStats } from '../../src/entity/userExpStats';
import { truncate } from '../../src/util/truncate';
import { loadFixtures } from '../helpers/loadFixtures';

const request = require('request-promise');
const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('define', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;
    let requestStub: sinon.SinonStub;
    let fixtures: any;

    before(() => {
        fixtures = loadFixtures(path.join(__dirname, '../fixtures/define'), 'utf8');
        cmd = new command.default();
        sandbox = sinon.createSandbox();
        requestStub = sandbox.stub(request, 'Request');
    });

    beforeEach(async () => {
        await Database.instance().init({
            name: 'test',
            type: 'sqljs',
            entities: [BotUser.User, UserExpStats, Dictionary],
            dropSchema: true,
            synchronize: true
        });
    });

    afterEach(() => Database.connection.close());

    after(() => sandbox.restore());

    it('should respond with a definition from urban dictionary', async () => {
        const phrase = 'whale';
        const definition = JSON.parse(fixtures.define);
        textChannelStub.guild = sinon.createStubInstance(Guild);
        const message: Message = new Message(textChannelStub, null, clientStub);
        message.author = sinon.createStubInstance(User);
        const embed = new RichEmbed();
        embed.setTitle(`Result for ${phrase}`);
        embed.setAuthor(message.author.username, message.author.avatarURL);
        embed.addField('Definition', `${truncate(1500, definition.list[0].definition)}`);
        embed.addField('Example', `${truncate(400, definition.list[0].example)}`);
        requestStub.resolves(JSON.parse(fixtures.define));

        await cmd.action(message, [phrase]);

        expect(message.channel.send).calledWith({ embed });
    });

    it('should call the api with the correct options', async () => {
        const phrase = 'whale';
        textChannelStub.guild = sinon.createStubInstance(Guild);
        const message: Message = new Message(textChannelStub, null, clientStub);
        const options = {
            callback: undefined,
            url: `https://api.urbandictionary.com/v0/define?`,
            qs: {
                page: 1,
                term: phrase
            },
            json: true
        };
        message.author = sinon.createStubInstance(User);
        requestStub.resolves(JSON.parse(fixtures.define));

        await cmd.action(message, [phrase]);

        expect(requestStub).calledWith(options);
    });

    it('should ask the user to pass a word/phrase if none is passed', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        message.author = sinon.createStubInstance(User);

        await cmd.action(message, ['']);

        expect(message.channel.send).calledWith('You must pass word/phrase to define.');
    });

    it('should let the user know if a word cannot be defined', async () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        textChannelStub.guild = sinon.createStubInstance(Guild);
        message.author = sinon.createStubInstance(User);
        requestStub.resolves(JSON.parse(fixtures.define_no_results));

        await cmd.action(message, ['qwertyui123']);

        expect(message.channel.send).calledWith('Could not define this.');
    });
});
