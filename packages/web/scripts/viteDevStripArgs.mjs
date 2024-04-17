import { execSync } from 'child_process';
const args = [];
let apiPort;
for (const arg of process.argv)
	if (arg.startsWith('-P') || arg.startsWith('--port')) apiPort = arg.split('=')[1];
	else args.push(arg);
execSync(
	`VITE_API_PORT=${apiPort} vite dev ${process.cwd()} ` +
		args.map((v) => JSON.stringify(v)).join(' '),

	{
		stdio: 'inherit',
		env: process.env
	}
);
