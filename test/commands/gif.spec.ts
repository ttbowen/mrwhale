import * as chai from 'chai';
import { Client, TextChannel, User } from 'discord.js';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Message } from 'yamdbf';

import * as command from '../../src/commands/useful/gif';
import { loadFixtures } from '../helpers/loadFixtures';

const request = require('request-promise');
const expect = chai.expect;
chai.use(sinonChai);

const clientStub = sinon.createStubInstance(Client);
const textChannelStub = sinon.createStubInstance(TextChannel);

describe('gif', () => {
  let cmd: command.default;
  let sandbox: sinon.SinonSandbox;
  let requestStub: sinon.SinonStub;
  let fixtures: any;

  before(() => {
    fixtures = loadFixtures(path.join(__dirname, '../fixtures/gif'), 'utf8');
    cmd = new command.default();
    sandbox = sinon.createSandbox();
    requestStub = sandbox.stub(request, 'Request');
  });

  after(() => sandbox.restore());

  it('should respond with a gif', async () => {
    const search = 'whale';
    const message: Message = new Message(textChannelStub, null, clientStub);
    requestStub.resolves(JSON.parse(fixtures.giphy));

    await cmd.action(message, [search]);

    expect(message.channel.send).calledWith(JSON.parse(fixtures.giphy).data.image_original_url);
  });

  it('should call the api with the correct options', async () => {
    const search = 'whale';
    const message: Message = new Message(textChannelStub, null, clientStub);
    const options = {
      callback: undefined,
      url: `http://api.giphy.com/v1/gifs/random?tag=${encodeURI(search)}`,
      qs: {
        api_key: 'dc6zaTOxFJmzC',
        rating: 'pg-13',
        limit: 1
      },
      json: true
    };
    requestStub.resolves(JSON.parse(fixtures.giphy));

    await cmd.action(message, [search]);

    expect(requestStub).calledWith(options);
  });

  it('should ask the user to provide a query is none is passed', async () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    requestStub.resolves(JSON.parse(fixtures.giphy));

    await cmd.action(message, ['']);

    expect(message.channel.send).calledWith('You must pass a search query for this command.');
  });

  it('should ask the user to provide a query is none is passed', async () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    requestStub.resolves(JSON.parse(fixtures.giphy));

    await cmd.action(message, ['']);

    expect(message.channel.send).calledWith('You must pass a search query for this command.');
  });

  it('should let the user know if there was an error', async () => {
    const message: Message = new Message(textChannelStub, null, clientStub);
    requestStub.rejects();

    await cmd.action(message, ['qwertyio123']);

    expect(message.channel.send).calledWith('An error occured while fetching gif.');
  });
});
