export const THEMES = [
  "health",
  "world problems",
  "spirituality",
  "technology",
  "storytelling",
  "science",
  "business",
  "design",
  "comedy",
  "true crime",
  "politics",
  "history",
  "philosophy",
  "culture",
  "music",
  "sports",
  "self-improvement",
] as const;

export type Theme = (typeof THEMES)[number];

export type Podcast = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
};

export type PodcastInput = {
  title: string;
  description?: string | null;
  url?: string | null;
  theme?: string | null;
};
