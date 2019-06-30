import * as chai from 'chai';
import { Client, ClientUser, TextChannel } from 'discord.js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../src/commands/invite';

const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('invite', () => {
  let cmd: command.default;
  let sandbox: sinon.SinonSandbox;

  before(() => {
    cmd = new command.default();
    sandbox = sinon.createSandbox();
  });

  after(() => sandbox.restore());

  it('should respond with an invite link', () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    clientStub.user = sinon.createStubInstance(ClientUser);
    clientStub.user.id = '414497162261430272';
    cmd.client = clientStub;

    cmd.action(message);

    expect(message.channel.send).calledWith(`
        You can invite me to your server with this link:\n <https://discordapp.com/oauth2/authorize?client_id=${
          clientStub.user.id
        }&scope=bot&permissions=2146958591>`);
  });
});
