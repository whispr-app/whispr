import fs from 'fs';
import qmimedb from 'querymimedb';
import mimeTypes from 'mime-types';

const query = (f)=>(mimeTypes.lookup(f) || qmimedb(f))

const object = {};
for (const file of fs
	.readdirSync('build', { recursive: true })
	.filter((v) => !fs.statSync('build/' + v).isDirectory() && !v.endsWith('out.js'))) {
	object[file] = [
		query('build/'+file),
		fs.readFileSync('build/' + file, 'base64'),
	];
}
fs.writeFileSync('build/out.mjs', 'export default ' + JSON.stringify(object));
fs.writeFileSync(
	'build/out.d.ts',
	`declare const _default: Record<string, [mimeType: string, fileData: string]>;
export default _default;
`
);
