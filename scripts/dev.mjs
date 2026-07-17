import { spawn } from 'node:child_process';

const children = new Set();
const start = (command, args) => {
  const child = spawn(command, args, {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit',
  });
  children.add(child);
  child.on('exit', (code) => {
    children.delete(child);
    if (code && code !== 0) process.exitCode = code;
  });
  return child;
};

start(process.execPath, ['server/index.mjs']);
if (process.platform === 'win32') {
  start(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd run dev:web']);
} else {
  start('npm', ['run', 'dev:web']);
}

const stop = () => {
  for (const child of children) child.kill();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
