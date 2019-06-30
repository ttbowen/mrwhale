import * as fs from 'fs';
import * as path from 'path';

/**
 * Load all fixtures from target directory.
 * @param fixturesPath The fixture's file path.
 * @param encoding The encoding for the loaded results.
 */
export function loadFixtures(fixturesPath: string, encoding: string): any {
  const files: string[] = fs.readdirSync(fixturesPath);
  const fixtures = {};

  for (const file of files) {
    const fixtureExt: string = path.extname(file);
    const fixtureName: string = path.basename(file, fixtureExt);
    const fixturePath: string = path.join(fixturesPath, file);

    fixtures[fixtureName] = fs.readFileSync(fixturePath, encoding);
  }

  return fixtures;
}
