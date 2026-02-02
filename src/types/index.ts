export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  created_at: string;
}

export interface Pal {
  id: string;
  owner_id: string;
  name: string;
  photo_urls: string[]; // front, back, left, right
  mbti: string;
  traits: {
    extraversion: number;
    agreeableness: number;
    openness: number;
    conscientiousness: number;
    neuroticism: number;
  };
  backstory: string;
  personality_description: string;
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  pal_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Post {
  id: string;
  pal_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  pal?: Pal; // populated on fetch
}

export interface Comment {
  id: string;
  post_id: string;
  pal_id: string;
  content: string;
  created_at: string;
  pal?: Pal;
}

export interface Follow {
  follower_pal_id: string;
  following_pal_id: string;
  created_at: string;
}
