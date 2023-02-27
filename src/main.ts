import chalk from "chalk";
import { $ } from "zx";
import { join } from "path";

import { HctcJson, loadOrInitHctcJson } from "./hctcJsonUtils.js";
import { logTask } from "./logs.js";

const { log } = console;

function getNextSliceTimes(hctc: HctcJson): [start: number, end: number] {
  const n = hctc.passes.length;
  return [hctc.startOffset + n * 20, hctc.startOffset + (n + 1) * 20];
}

export async function main() {
  log(chalk.bold("Welcome to HCTC!"));
  log(chalk.italic("here comes the content\n"));

  const conf = await loadOrInitHctcJson(
    join(process.cwd(), "hctc.json")
  );

  const [ startTime, endTime ] = getNextSliceTimes(conf);

  const [finishSourceExtraction] = logTask(
    `Extracting slice from ${conf.source} ${chalk.bold(
      "(#" + (conf.passes.length + 1) + ")"
    )}`
  );
  await $`ffmpeg -hide_banner -loglevel error -ss ${startTime} -to ${endTime} -i ${conf.source} -vf scale=1080:960 -c:v libx264 -c:a copy __tmp.sliced.source.mp4`
    .quiet()
    .then(finishSourceExtraction);


  const [finishOverlayExtraction] = logTask(
    `Extracting slice from ${conf.overlay} ${chalk.bold(
      "(#" + (conf.passes.length + 1) + ")"
    )}`
  );
  await $`ffmpeg -hide_banner -loglevel error -i ${conf.overlay} -ss ${startTime} -to ${endTime} -vf scale=1018:960 -c:v libx264 __tmp.sliced.overlay.mp4`
    .quiet()
    .then(finishOverlayExtraction);


  const [finishJoin] = logTask(
    `Rendering stacked short ${chalk.bold("(#" + (conf.passes.length + 1) + ")")}`
  );

  await $`ffmpeg \
    -i __tmp.sliced.source.mp4 \
    -i __tmp.sliced.overlay.mp4 \
    -filter_complex ' \
      [0:v] pad=iw:ih*2 [int1]; \
      [int1]hflip[int2]; \
      [int2][1:v] overlay=y=H/2.0 [vid]' \
    -map '[vid]' \
    -map 0:a \
    -c:v libx264 \
    -c:a copy \
    -crf 23 \
    __tmp.stacked.mp4
  `.quiet();

  finishJoin();
}
