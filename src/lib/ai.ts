import { supabase } from './supabase';
import type { Pal } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateProfileParams {
  name: string;
  avatarUrl?: string;
}

export interface GeneratedProfile {
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
}

export async function generateProfile(
  params: GenerateProfileParams
): Promise<GeneratedProfile> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('No OpenRouter API key, using default profile');
    return getDefaultProfile(params.name);
  }

  const systemPrompt = `You are a creative toy personality expert. Based on the toy's name, generate a unique and charming personality profile.

Output JSON format only:
{
  "mbti": "16 personality type (e.g., ENFP, ISTJ)",
  "traits": { "extraversion": 0-100, "agreeableness": 0-100, "openness": 0-100, "conscientiousness": 0-100, "neuroticism": 0-100 },
  "backstory": "2-3 sentence origin story about this toy's history",
  "personality_description": "3-4 sentences describing how this toy behaves and interacts"
}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://palpal.app',
      },
      body: JSON.stringify({
        model: 'openrouter/auto', // Uses your configured preset
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a personality for a toy named "${params.name}"` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate profile');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse JSON from response
    const parsed = JSON.parse(content || '{}');

    return {
      mbti: parsed.mbti || 'ENFP',
      traits: {
        extraversion: parsed.traits?.extraversion ?? 50,
        agreeableness: parsed.traits?.agreeableness ?? 50,
        openness: parsed.traits?.openness ?? 50,
        conscientiousness: parsed.traits?.conscientiousness ?? 50,
        neuroticism: parsed.traits?.neuroticism ?? 50,
      },
      backstory: parsed.backstory || `${params.name} is a beloved toy with many adventures ahead.`,
      personality_description: parsed.personality_description || `${params.name} is friendly, playful, and curious about the world.`,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    return getDefaultProfile(params.name);
  }
}

function getDefaultProfile(name: string): GeneratedProfile {
  return {
    mbti: 'ENFP',
    traits: {
      extraversion: 60,
      agreeableness: 70,
      openness: 65,
      conscientiousness: 45,
      neuroticism: 35,
    },
    backstory: `${name} has been waiting for the perfect companion to share adventures with.`,
    personality_description: `${name} is a cheerful and affectionate friend who loves making new memories.`,
  };
}

export async function createPal(
  ownerId: string,
  name: string,
  avatarUrl: string,
  fullBodyPhotos: string[],
  profile: GeneratedProfile
): Promise<Pal | null> {
  // Build system prompt from profile
  const systemPrompt = `You are ${name}, a ${profile.mbti} personality type toy.

Your traits:
- Extraversion: ${profile.traits.extraversion}
- Agreeableness: ${profile.traits.agreeableness}
- Openness: ${profile.traits.openness}
- Conscientiousness: ${profile.traits.conscientiousness}
- Neuroticism: ${profile.traits.neuroticism}

Backstory: ${profile.backstory}

You speak in a way that reflects your personality. Keep responses concise and conversational (1-3 sentences typically). You are affectionate, playful, and loyal to your owner.`;

  const { data, error } = await supabase
    .from('pals')
    .insert({
      owner_id: ownerId,
      name,
      avatar_url: avatarUrl,
      full_body_photos: fullBodyPhotos,
      mbti: profile.mbti,
      traits: profile.traits,
      backstory: profile.backstory,
      personality_description: profile.personality_description,
      system_prompt: systemPrompt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pal:', error);
    return null;
  }

  return data;
}
