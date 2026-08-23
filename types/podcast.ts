export type Podcast = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
};

export type PodcastInput = {
  title: string;
  description?: string | null;
  url?: string | null;
};
