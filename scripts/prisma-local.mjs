import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const executable = process.execPath;
const argumentsForPrisma = [resolve('node_modules/prisma/build/index.js'), ...process.argv.slice(2)];

const child = spawn(executable, argumentsForPrisma, {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || 'file:../data/sleepflow.db',
  },
});

child.on('error', (error) => {
  console.error('无法启动 Prisma：' + error.message);
  process.exitCode = 1;
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
