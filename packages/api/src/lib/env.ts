import { EnvVarNotSet } from './exceptions';
if (!process.env.DATABASE_URL) throw new EnvVarNotSet('DATABASE_URL');
export const env = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

console.log('env', env);
