import { $ } from "zx";
import chalk from 'chalk';
import fs from 'fs';

const { log } = console;

async function assertFfmpegInPath() {
  try {
    await $`ffmpeg -version > /dev/null`;
  } catch {
    throw new Error("Could not find ffmpeg binary in your $PATH!");
  }
}

async function main() {
  await assertFfmpegInPath();
  log(chalk.bold('hello, world!'));
}

main();
