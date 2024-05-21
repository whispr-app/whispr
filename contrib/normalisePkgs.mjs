#!/usr/bin/env node

import { processPackage } from '@3xpo/pkgmetatool';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';

const monorepoRoot = process.cwd();
const monorepoRootPackage = JSON.parse(
  fs.readFileSync(path.join(monorepoRoot, 'package.json'), 'utf-8')
);

const packages = execSync('nx exec -- pwd')
  .toString()
  .split('\n')
  .map((x) => x.trim())
  .filter((x) => x.length > 0 && fs.existsSync(x))
  .map((x) => path.relative(monorepoRoot, x));

packages.forEach((pkg) => {
  const pkgPath = path.join(monorepoRoot, pkg, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  fs.writeFileSync(
    pkgPath,
    JSON.stringify(
      {
        ...processPackage(pkgJson, {
          path: pkg,
          author: 'Morgan Dilling',
          repository: 'https://github.com/whispr-app/whispr',
          bugs: {
            url: 'https://github.com/whispr-app/whispr/issues',
          },
          ensureExports: true,
          fallbackTypings: true,
          sort: true,
        }),
        version: monorepoRootPackage.version,
      },
      null,
      2
    ) + '\n'
  );
});
