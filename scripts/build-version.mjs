import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(await readFile(join(__dirname, '../package.json'), 'utf-8'));

await writeFile(
  join(__dirname, '../src/version.ts'),
  `export const VERSION = '${pkg.version}';\n`,
);
