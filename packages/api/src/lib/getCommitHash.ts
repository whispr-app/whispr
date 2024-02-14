import { execSync } from 'child_process';

export const hash = process.env.COMMIT_HASH ?? execSync('git rev-parse HEAD').toString().trim();
