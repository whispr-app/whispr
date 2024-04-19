import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

const gitHashFull = execSync('git rev-parse HEAD').toString().trim();
const gitHashShort = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		PKG: pkg,
		GIT_HASH: {
			full:
				gitHashFull !== 'fatal: not a git repository (or any of the parent directories): .git'
					? gitHashFull
					: 'unknown',

			short:
				gitHashShort !== 'fatal: not a git repository (or any of the parent directories): .git'
					? gitHashShort
					: 'unknown'
		}
	}
});
