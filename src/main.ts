import chalk from 'chalk';
import { $ } from "zx";
import { join } from 'path';

import { loadOrInitHctcJson } from "./hctcJsonUtils.js";

const { log } = console;

async function assertFfmpegInPath() {
  try {
    await $`ffmpeg -version > /dev/null`;
  } catch {
    throw new Error("Could not find ffmpeg binary in your $PATH!");
  }
}

export async function main() {
  await assertFfmpegInPath();
  log(chalk.bold('hello, world!'));

  const conf = loadOrInitHctcJson(join(process.cwd(), 'hctc.json'));

  log({ conf });
}

main();
