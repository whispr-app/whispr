import adapter from '@sveltejs/adapter-static';
import preprocessor from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';
import { transformSync } from 'esbuild';
import browserslist from 'browserslist';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('./package.json')} */
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const list = browserslist(pkg.browserslist);
const esbKnownTargets = `    chrome
deno
edge
firefox
hermes
ie
ios
node
opera
rhino
safari`
	.trim()
	.split('\n');
const esbuildTargets = list
	.map((v) => v.replace(' ', ''))
	.filter((v) => esbKnownTargets.find((e) => e.startsWith(v)));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: preprocessor({
		postcss: {
			plugins: [autoprefixer()]
		},
		scss: {
			includePaths: [path.resolve(__dirname, 'src')],
			outputStyle: 'compressed'
		},
		typescript({ content, filename }) {
			const { code, map } = transformSync(content, {
				loader: 'ts',
				format: 'esm',
				charset: 'utf8',
				color: true,
				treeShaking: false,
				target: esbuildTargets,
				keepNames: true,
				sourcefile: filename,
				tsconfigRaw: {
					compilerOptions: {
						preserveValueImports: true
					}
				},
				define: {
					'process.env.PREPROCESSING': 'true',
					PREPROCESSING: 'true'
				}
			});
			return { code, map };
		},
		sourceMap: true
	}),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			fallback: '404.html'
		})
	},
	base: '/dist/'
};
export default config;
