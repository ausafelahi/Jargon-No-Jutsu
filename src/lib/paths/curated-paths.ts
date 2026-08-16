export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  concepts: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "system-design",
    title: "System Design Path",
    description:
      "How large systems get planned, built, and led. Straight from the PRD's own example.",
    concepts: [
      "Strategic Thinking",
      "System Design",
      "Leadership in Distributed Teams",
    ],
  },
  {
    slug: "debugging-and-problem-solving",
    title: "Debugging & Problem Solving",
    description:
      "Finding what's actually broken, and thinking through edge cases before they bite.",
    concepts: ["Debugging", "Edge Cases", "Code Review"],
  },
  {
    slug: "performance-and-optimization",
    title: "Performance & Optimization",
    description:
      "Making things fast, and knowing what to cache versus what to skip.",
    concepts: ["Optimization", "Caching", "Performance Optimization"],
  },
  {
    slug: "growth-mindset",
    title: "Growth Mindset",
    description:
      "Getting better at getting better: resilience, learning, and steady improvement.",
    concepts: ["Resilience", "Continuous Learning", "Incremental Improvement"],
  },
];

export function getPathBySlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}
