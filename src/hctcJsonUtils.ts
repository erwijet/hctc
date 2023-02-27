import fs from "fs";
import { z } from "zod";

export const hctcJsonSchema = z.object({
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

export function loadOrInitHctcJson(path: string): HctcJson {
  console.log({ path });

  if (fs.existsSync(path))
    return hctcJsonSchema.parse(JSON.parse(fs.readFileSync(path).toString()));

  fs.writeFileSync(
    path,
    JSON.stringify({
      passes: [],
    })
  );

  return loadOrInitHctcJson(path);
}
