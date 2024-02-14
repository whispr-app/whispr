// Imports
import argvFetcher from './argvFetcher';

// Exceptions
import { PackageVersionNotFound } from './exceptions';

// Fetch repo information
import packageJson from '../../package.json';

if (!packageJson.version) throw new PackageVersionNotFound();

export const argvs = process.argv;
export const version = argvFetcher(
  argvs,
  ['-V', '--version'],
  packageJson.version
);

export const port = Number(argvFetcher(argvs, ['-P', '--port'], '28980'));
export const domain = argvFetcher(argvs, ['-D', '--domain']);
export const skipDomainCheck = argvs.includes('--skip-domain-check');
