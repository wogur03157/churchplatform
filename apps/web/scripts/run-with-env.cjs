const { spawn } = require("node:child_process");

const argv = process.argv.slice(2);
const extraEnv = {};

let index = 0;
while (index < argv.length) {
  const arg = argv[index];
  const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(arg);
  if (!match) break;
  extraEnv[match[1]] = match[2];
  index += 1;
}

const command = argv[index];
const args = argv.slice(index + 1);

if (!command) {
  console.error("Missing command to run.");
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    ...extraEnv,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
