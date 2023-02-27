import chalk from "chalk";
import fs from "fs";
import { z } from "zod";
import { logTask } from "./logs.js";
import prompt from "prompt";
import { join } from "path";

export const hctcJsonSchema = z.object({
  source: z.string(),
  overlay: z.string(),
  startOffset: z.number(),
  passes: z.array(
    z.object({
      seek: z.object({
        start: z.number(),
        end: z.number(),
      }),
    })
  ),
});

export type HctcJson = z.infer<typeof hctcJsonSchema>;

export async function loadOrInitHctcJson(path: string): Promise<HctcJson> {
  if (fs.existsSync(path)) {
    const parsed = hctcJsonSchema.parse(
      JSON.parse(fs.readFileSync(path).toString())
    );
    return parsed;
  }

  const { source, overlay, startOffset } = await prompt.get({
    properties: {
      source: {
        name: "Source Video",
        description: "Path to source video",
        type: "string",
        message: "Provided value must be a file",
        required: true,
        before: (v) => join(process.cwd(), v),
        conform: (v) => fs.existsSync(v),
      },
      overlay: {
        name: "Overlay Video",
        description: "Path to overlay video (b-roll content)",
        type: "string",
        message: "Provided value must be a file",
        required: true,
        before: (v) => join(process.cwd(), v),
        conform: (v) => fs.existsSync(v),
      },
      startOffset: {
        name: "Offset",
        description: "Start offset for source video (seconds)",
        type: "number",
        default: 20,
      },
    },
  });

  console.log();

  const [finishFileWrite] = logTask(
    `Writing a new ${chalk.bold("hctc.json")} file for you`
  );

  fs.writeFileSync(
    path,
    JSON.stringify({
      startOffset,
      source,
      overlay,
      passes: [],
    })
  );

  finishFileWrite();

  return loadOrInitHctcJson(path);
}
