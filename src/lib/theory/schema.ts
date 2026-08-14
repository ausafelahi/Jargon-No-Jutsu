import { z } from "zod";

export const generatedTheorySchema = z.object({
  title: z.string().min(10).max(150),
  content: z
    .string()
    .min(
      600,
      "Theory content too short — this is supposed to be long-form, not a summary",
    )
    .max(6000),
});

export type GeneratedTheoryBody = z.infer<typeof generatedTheorySchema>;
