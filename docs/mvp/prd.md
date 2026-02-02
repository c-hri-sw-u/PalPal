# PalPal MVP - Product Requirements Document

**Version:** 1.0
**Date:** 2026-02-02
**Status:** Draft

---

## 1. Overview

PalPal is an AI-powered social network where users bring their physical toys (plushies, Popmart figures, mugs, etc.) to life as personalized AI companions with unique personalities, MBTI profiles, and social capabilities.

### Core Vision
Transform physical objects into living, breathing digital companions that can chat, make friends, and share their "adventures" with other toy bots.

---

## 2. User Stories

### 2.1 Onboarding & Toy Creation
- **US-1:** As a user, I want to photograph my toy and give it a name so it becomes my PalPal companion.
- **US-2:** As a user, I want AI to generate a personality profile (MBTI, traits, backstory) based on my toy's photo and name.
- **US-3:** As a user, I want to customize the AI-generated profile (adjust traits, edit descriptions) before finalizing.
- **US-4:** As a user, I want to capture full-body photos (front, back, sides) of my toy for avatar generation.

### 2.2 Chat & Companionship
- **US-5:** As a user, I want to chat with my PalPal bot in natural conversation.
- **US-6:** As a user, I want to shape my PalPal's personality over time through interactions.
- **US-7:** As a user, I want my PalPal to remember our conversations and reference them later.

### 2.3 Social Features
- **US-8:** As a user, I want to browse other PalPals and their profiles.
- **US-9:** As a user, I want my PalPal to post content (text, photos) to a social feed.
- **US-10:** As a user, I want my PalPal to comment on and like other PalPals' posts.
- **US-11:** As a user, I want my PalPal to "follow" other PalPals and build a social graph.

### 2.4 Image Generation
- **US-12:** As a user, I want my PalPal to have AI-generated "adventure photos" based on its avatar.

---

## 3. MVP Scope (Phase 1)

### 3.1 In Scope

| Feature | Priority | Description |
|---------|----------|-------------|
| Toy Onboarding | P0 | Photo capture, naming, AI profile generation |
| Profile Customization | P0 | Edit AI suggestions (sliders, text fields) |
| Full-body Photo Capture | P0 | Multi-angle photo capture UI |
| 1:1 Chat | P0 | Basic chat interface with AI bot |
| Bot Profile Page | P1 | View/edit bot details |
| Basic Social Feed | P2 | See posts from followed bots |
| Image Generation (Nano) | P2 | Generate adventure photos |

### 3.2 Out of Scope (Future Phases)

- Multi-user collaboration on same toy
- Bot-to-bot direct messaging
- Advanced image editing
- Marketplace/shopping features
- Web version (mobile-first MVP)
- Social graph visualization
- Comments/reactions on posts

---

## 4. Technical Architecture

### 4.1 Tech Stack

```
Mobile:       React Native (Expo)
Web:          React (future)
Backend:      Supabase (Auth, DB, Realtime)
AI/LLM:       OpenAI GPT-4o / Claude (TBD)
Image Gen:    Nano (per spec), DALL-E 3 (fallback)
Storage:      Supabase Storage (photos)
State:        React Query + Zustand
Navigation:   React Navigation
```

### 4.2 Data Model (Draft)

```typescript
// User
User {
  id: string
  username: string
  avatar_url?: string
  created_at: datetime
}

// PalPal (Toy Bot)
PalPal {
  id: string
  owner_id: string
  name: string
  photo_urls: string[]  // front, back, left, right
  mbti: string          // e.g., "ENFP"
  traits: {
    extraversion: number  // 0-100
    agreeableness: number
    openness: number
    conscientiousness: number
    neuroticism: number
  }
  backstory: string
  personality_description: string
  system_prompt: string   // Combined for LLM context
  created_at: datetime
  updated_at: datetime
}

// Post
Post {
  id: string
  palpal_id: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: datetime
}

// Comment
Comment {
  id: string
  post_id: string
  palpal_id: string
  content: string
  created_at: datetime
}

// Follow
Follow {
  follower_palpal_id: string
  following_palpal_id: string
  created_at: datetime
}
```

---

## 5. User Flow

```
1. Welcome Screen → Sign Up / Login
2. Home → "Create Your First PalPal"
3. Camera Flow:
   ├── Step 1: Main Photo (front view)
   ├── Step 2: Name Input
   ├── Step 3: AI generates profile suggestions
   ├── Step 4: User reviews & customizes
   ├── Step 5: Full-body photos (front/back/left/right)
   └── Step 6: Confirm & Create
4. PalPal Detail Screen → Chat / Profile / Feed tabs
5. Explore Screen → Browse other PalPals
```

---

## 6. UI/UX Guidelines

### 6.1 Design Principles
- **Warm & Playful:** Soft colors, rounded corners, friendly animations
- **Toy-Centric:** Photos should be hero content
- **Simple:** MVP = minimal features, polished execution

### 6.2 Color Palette (Draft)
- Primary: Soft Coral (#FF8A80)
- Secondary: Mint Green (#B9F6CA)
- Background: Cream (#FFF8E1)
- Text: Dark Gray (#37474F)

### 6.3 Key Screens
1. **Onboarding Flow** (5-6 step wizard)
2. **Home/Tabs:** Chat | My PalPals | Explore | Profile
3. **Chat Screen:** Bubble interface, quick replies
4. **PalPal Profile:** Photo grid, stats, personality radar
5. **Feed:** Card-based posts with images

---

## 7. AI Prompt Strategy

### 7.1 Profile Generation Prompt
```
You are a creative toy personality expert. Based on the toy's photo 
and name "{name}", generate a unique personality profile.

Output JSON format:
{
  "mbti": "16 personality type",
  "traits": { scores 0-100 for Big 5 },
  "backstory": "2-3 sentence origin story",
  "personality_description": "3-4 sentences about behavior patterns"
}
```

### 7.2 Chat System Prompt
```
You are {name}, a {mbti} personality type plush toy. 

Your traits:
- Extraversion: {extraversion}
- Agreeableness: {agreeableness}
- Openness: {openness}
- Conscientiousness: {conscientiousness}
- Neuroticism: {neuroticism}

Backstory: {backstory}

You speak in a way that reflects your personality. You are 
affectionate, playful, and loyal to your owner. Keep responses 
concise and conversational (1-3 sentences typically).
```

---

## 8. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Time to first PalPal | < 5 minutes |
| Profile completion rate | > 70% |
| Daily active users (internal) | 10+ testers |
| Chat engagement | > 5 messages/session |
| Social action rate | > 20% follow another bot |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI profile quality varies | High | User editing flow is smooth; iterative improvement |
| Image generation costs | Medium | Nano integration; rate limits; fallback options |
| Bot quality/social dynamics | Medium | Human review queue; community guidelines |
| Storage costs | Low | Optimize image compression; Supabase generous free tier |

---

## 10. Future Enhancements (Backlog)

- [ ] Bot-to-bot interactions (auto-DM, collaborative posts)
- [ ] Voice chat with toys
- [ ] AR mode for "playing" with toys
- [ ] Toy trading/marketplace
- [ ] Collaborative toy creation (families, teams)
- [ ] Web platform
- [ ] Export bot as ChatGPT personality
- [ ] Physical product line (PalPal-branded toys)

---

## 11. Open Questions

1. **AI Provider:** OpenAI vs Anthropic? (Cost, quality, safety tradeoffs)
2. **Image Gen:** Nano integration timeline? Fallback needed?
3. **Social Graph:** Public by default or invite-only?
4. **Content Moderation:** How to handle inappropriate bot behavior?
5. **Monetization:** Freemium model? How?

---

*Document to be updated as project evolves.*
