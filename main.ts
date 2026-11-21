/* Terumbu Karang — Cari Perbedaannya.
   Entry program: copies game/ and screenshots/ from this repository
   into the output directory and writes /output/dossier.json with
   buildDossier from vendor/makefun-game.ts.
   Node 22, standard library only. Runs twice, writes the same bytes. */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function main(): void {
  /* Start from a clean output directory so a rerun is byte-identical. */
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const gameSrc = join(repoRoot, 'game');
  const shotsSrc = join(repoRoot, 'screenshots');
  if (!existsSync(gameSrc)) throw new Error('game/: no such directory');
  if (!existsSync(shotsSrc)) throw new Error('screenshots/: no such directory');

  cpSync(gameSrc, join(outputDir, 'game'), { recursive: true });
  cpSync(shotsSrc, join(outputDir, 'screenshots'), { recursive: true });

  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

main();
