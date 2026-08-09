import { z } from "zod";

export const generatedLessonSchema = z.object({
  explanation: z
    .string()
    .min(80, "Explanation too short — must be a real technical definition")
    .max(900),
  realWorldApplication: z.string().min(40).max(600),
  careerAdvice: z.string().min(20).max(400),
});

export type GeneratedLessonBody = z.infer<typeof generatedLessonSchema>;
