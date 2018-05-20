import * as chai from 'chai';
import { Channel, Client, ClientUser, Collection, RichEmbed, TextChannel, User } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Guild, Message } from 'yamdbf';

import * as command from '../../src/commands/info/stats';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('stats', () => {
    let cmd: command.default;
    let sandbox: sinon.SinonSandbox;

    before(() => {
        cmd = new command.default();
        sandbox = sinon.createSandbox();

        const memoryUsage = {
            rss: 137039872,
            heapTotal: 69570560,
            heapUsed: 62916536,
            external: 247241
        };
        sandbox.stub(process, 'memoryUsage').callsFake(() => memoryUsage);
        clientStub.guilds = new Collection<string, Guild>();
        clientStub.channels = new Collection<string, Channel>();
        clientStub.users = new Collection<string, User>();
        clientStub.user = sinon.createStubInstance(ClientUser);
        clientStub.user.username = 'Tom';
        cmd.client = clientStub;
    });

    after(() => sandbox.restore());

    it('should respond with bot statistics', () => {
        const message: Message = new Message(textChannelStub, null, clientStub);
        const fractionalDigits = 2;
        const memUnit = 1024;
        const memoryUsage = process.memoryUsage().heapUsed / memUnit / memUnit;
        const colour = 7911109;
        const embed = new RichEmbed()
            .addField('Servers', clientStub.guilds.size)
            .addField('Channels', clientStub.channels.size)
            .addField('Users', clientStub.users.size)
            .addField('Memory Usage', `${memoryUsage.toFixed(fractionalDigits)} MB`)
            .setTitle(`${clientStub.user.username.toUpperCase()}'S STATISTICS`)
            .setColor(colour);

        cmd.action(message);

        expect(message.channel.send).calledWith({ embed });
    });
});
