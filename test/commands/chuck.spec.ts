import * as chai from 'chai';
import { Client, TextChannel } from 'discord.js';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../src/commands/fun/chuck';
import { loadFixtures } from '../helpers/loadFixtures';

const request = require('request-promise');
const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('chuck', () => {
  let cmd: command.default;
  let sandbox: sinon.SinonSandbox;
  let requestStub: sinon.SinonStub;
  let fixtures: any;
  let options: any;

  before(() => {
    fixtures = loadFixtures(path.join(__dirname, '../fixtures/chuck'), 'utf8');
    cmd = new command.default();
    sandbox = sinon.createSandbox();
    requestStub = sandbox.stub(request, 'Request');
  });

  beforeEach(() => {
    options = {
      callback: undefined,
      url: `http://api.icndb.com/jokes/random?`,
      method: 'GET',
      qs: {
        escape: 'javascript',
        firstName: '',
        lastName: ''
      },
      headers: {
        'Content-type': 'application/json'
      },
      json: true
    };
  });

  after(() => sandbox.restore());

  it('should respond with a random chuck norris joke', async () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    requestStub.resolves(JSON.parse(fixtures.chuck));

    await cmd.action(message, ['', '', '']);

    expect(message.channel.send).calledWith(JSON.parse(fixtures.chuck).value.joke);
  });

  it('should call with firstname and lastname if specified', async () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    const firstName = 'Thomas';
    const lastName = 'Bowen';
    requestStub.resolves(JSON.parse(fixtures.chuck));
    options.qs.firstName = firstName;
    options.qs.lastName = lastName;

    await cmd.action(message, [firstName, lastName, '']);

    expect(requestStub).calledWith(options);
  });

  it('should call with category if specified', async () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    const category = 'nerdy';
    requestStub.resolves(JSON.parse(fixtures.chuck));
    options.url += `category=[${category}]`;

    await cmd.action(message, ['', '', category]);

    expect(requestStub).calledWith(options);
  });
});
