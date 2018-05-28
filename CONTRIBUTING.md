# Contributing

## Quick Guide

To contribute, you should do the following:

1. Go to the [mrwhale](https://github.com/bowenwaregames/mrwhale) repository and click the Fork button.
2. Ensure git is installed on your local machine.
3. Clone your fork onto your local machine using `$ git clone https://github.com/<your_username>/mrwhale.git` but replace `<your_username>` with your GitHub username.
4. Change to the mrwhale directory e.g. `$ cd mrwhale`.
5. Configure a remote to the original repository using `$ git remote add upstream https://github.com/bowenwaregames/mrwhale.git`.
6. Check that you are on the `dev` branch using `$ git status`. If you are not, switch branch using `$ git checkout dev`
7. Create a branch for your feature with a name that best describes your feature e.g. `$ git checkout -b your-command`.
8. Go through the installation guide on the README.
9. Make your code changes and commit them.
10. Push your changes to your forked remote `$ git push -u origin your-command`.
11. In your browser visit your forked repository and click **"Compare & pull request"** under **"Your recently pushed branches:**".
12. In your pull request describe a bit about your branch and the changes you made. Once you are happy click **"Create pull request"**.

## General guidelines

- Before submitting a pull request make sure:
  - The tests still pass by running `npm run test`.
  - There are no linter errors. You can check this by running `npm run lint` and `npm run lint:fix` to auto fix lint errors.

- Avoid adding new modules if there's already a similar one present.
- File names should start with a lowercase letter. e.g. `conchshell.ts`
- Commit little and often with descriptive commit messages.

## Coding style

This project uses TSLint to enforce a consistent coding style throughout the project. However the general rules are as followed:

- Always use `const` and `let`. `var` will be rejected by the linter.
- Class names should start with an uppercase letter. e.g. `AwesomeCommand`.
- Functions, methods, variables and parameters should be `camelCase`.
- External imports should be separated from our imports and be in alphabetical order.
- `public` methods should have jsdocs. However don't add jsdocs for overridden methods on your `Command` classes.

## Writing a command

### Location

- All commands should go under the `src/commands` directory and should be under the group your command belongs to. So for example if your command has the group set as `fun` it should be in `src/commands/fun`.

### Command structure

- A command module should export one default class extending from the `Command` class imported from the YAMDBF module.
- The default constructor should be passing an object containing the properties `name`, `desc`, `usage` and `group` to the `super` call.
- Should have one `public` method called `action`. Any other methods should be `private`.

A basic command class can be found below.

```ts
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'name',
            desc: 'desc',
            usage: '<prefix>name',
            group: 'fun'
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
    }
}
```

## Writing tests

Tests are highly encouraged throughout the project. Currently `mocha`, `chai` and `sinon` is being used for the tests.

Below are some guidelines for writing new tests.

### Location

- All tests should go under the `test` directory.
- Command tests should be located under `test/commands` and end with the extension `.spec.ts`.
- Test fixtures should come under `test/fixtures`.

### Test structure and guidelines

- Your test spec should have a `describe` for the class, function or method you are testing. If you are testing a command 
  class you call it the name of of your command.
- Test names should be as descriptive as possible.

For examples of how tests have already been structured, check out the existing tests.