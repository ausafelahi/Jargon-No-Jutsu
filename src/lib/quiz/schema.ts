import { z } from "zod";

export const generatedQuizSchema = z.object({
  question: z.string().min(15).max(300),
  options: z.array(z.string().min(1).max(150)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(20).max(500),
});

export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;
