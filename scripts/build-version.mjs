import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(await readFile(join(__dirname, '../package.json')));

await writeFile(join(__dirname, '../src/version.ts'), `export const VERSION = '${pkg.version}';`);
