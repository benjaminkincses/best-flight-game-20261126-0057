import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';
const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
mkdirSync(output, { recursive: true });
cpSync(join(root, 'game'), join(output, 'game'), { recursive: true });
mkdirSync(join(output, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) cpSync(join(root, 'screenshots'), join(output, 'screenshots'), { recursive: true });
const dossier = buildDossier(output, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, game_max_files: 993, game_max_bytes: 50331648, game_path_max_bytes: 1000 });
writeFileSync(join(output, 'dossier.json'), dossier);
console.log(`Meridian Ridge copied to ${output}; dossier.json: ${dossier.length} bytes`);

function countFiles(directory: string): number {
  return readdirSync(directory, { withFileTypes: true }).reduce((count, entry) =>
    count + (entry.isDirectory() ? countFiles(join(directory, entry.name)) : entry.isFile() ? 1 : 0), 0);
}
const sourceGameFiles = countFiles(join(root, 'game'));
const outputGameFiles = countFiles(join(output, 'game'));
if (sourceGameFiles !== outputGameFiles) {
  console.error(`Game file count mismatch: source ${sourceGameFiles}, output ${outputGameFiles}`);
  process.exitCode = 1;
}
const writtenDossier = readFileSync(join(output, 'dossier.json'));
JSON.parse(writtenDossier.toString('utf8'));
const screenshotCount = readdirSync(join(output, 'screenshots'), { withFileTypes: true })
  .filter(entry => entry.isFile() && !entry.name.startsWith('.') && /\.(png|jpe?g)$/i.test(entry.name)).length;
console.log(`Hand-in verified: ${outputGameFiles} game files, ${screenshotCount} screenshots, dossier ${writtenDossier.length} bytes`);
