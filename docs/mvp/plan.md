# PalPal MVP - Project Plan

**Version:** 1.0
**Date:** 2026-02-02
**Based on:** PRD v1.0

---

## 1. Milestones

| Milestone | Target | Deliverables |
|-----------|--------|--------------|
| M1: Foundation | Week 1 | Project setup, Auth, DB schema |
| M2: Core MVP | Week 2-3 | Onboarding flow, Profile, 1:1 Chat |
| M3: Social | Week 4 | Feed, Follow system, Posts |
| M4: Polish | Week 5 | UI polish, Bug fixes, Testing |

---

## 2. Phase Breakdown

### Phase 1: Foundation (Week 1)

#### 1.1 Project Setup
- [ ] Initialize React Native + Expo project
- [ ] Configure TypeScript + ESLint + Prettier
- [ ] Set up folder structure
- [ ] Configure GitHub repo + CI/CD (GitHub Actions)
- [ ] Add `.env.example` for Supabase + OpenRouter keys

#### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Run migration: `supabase/migrations/`
- [ ] Tables: `users`, `pals`, `posts`, `comments`, `follows`
- [ ] Enable Storage buckets: `toy-photos`, `post-images`
- [ ] Configure RLS policies

#### 1.3 Authentication
- [ ] Supabase Auth integration (Email + Social)
- [ ] Auth context + hooks
- [ ] Protected routes wrapper
- [ ] Onboarding flow for new users

**Phase 1 Deliverable:** User can sign up, login, see empty home

---

### Phase 2: Core MVP (Week 2-3)

#### 2.1 Toy Onboarding Flow (P0)
- [ ] Camera permission handling
- [ ] Photo capture UI (step-by-step wizard)
- [ ] Name input screen
- [ ] AI profile generation (OpenRouter + GPT-4o-mini)
- [ ] Profile customization UI:
  - [ ] MBTI selector (dropdown)
  - [ ] Big 5 sliders (0-100)
  - [ ] Text fields (backstory, personality)
- [ ] Full-body photo capture (4 angles)
- [ ] Create Pal API call

#### 2.2 Pal Profile Page (P1)
- [ ] Display photo grid (ins-like layout)
- [ ] Show personality stats (MBTI, Big 5 radar)
- [ ] Display backstory + description
- [ ] Edit profile button
- [ ] **NEW:** Owner's profile links (social media)

#### 2.3 1:1 Chat (P0)
- [ ] Chat screen UI (bubble interface)
- [ ] Message history from Supabase
- [ ] Real-time subscription (new messages)
- [ ] Send message API
- [ ] AI response streaming (OpenRouter)
- [ ] Quick reply suggestions
- [ ] System prompt injection based on Pal profile

**Phase 2 Deliverable:** User creates a Pal, customizes profile, chats with it

---

### Phase 3: Social Features (Week 4)

#### 3.1 Feed System (P2)
- [ ] Friend Circle feed (followed pals' posts)
- [ ] World Channel feed (all pals' posts, ins-like)
- [ ] Tab switcher UI
- [ ] Post card component (avatar, content, image, likes, comments)

#### 3.2 Follow System
- [ ] Explore screen (browse all pals)
- [ ] Pal profile → Follow button
- [ ] Follow API + real-time update
- [ ] Following list UI

#### 3.3 Posts & Interactions (P2)
- [ ] Create post API (text + optional image)
- [ ] Image upload to Supabase Storage
- [ ] Like post API + real-time counter
- [ ] Comment UI + API

#### 3.4 Image Generation (P2)
- [ ] Nano API integration
- [ ] "Generate Adventure Photo" button
- [ ] Image generation status UI
- [ ] Save generated image to post

**Phase 3 Deliverable:** Users can follow pals, see feed, post content, generate images

---

### Phase 4: Polish & Testing (Week 5)

#### 4.1 UI/UX Polish
- [ ] Light/Dark mode support
- [ ] iOS26 glass style implementation
- [ ] Animations (framer-motion)
- [ ] Loading states + skeleton screens
- [ ] Empty states illustration
- [ ] Error boundaries + toast messages

#### 4.2 Performance & Quality
- [ ] Image compression before upload
- [ ] React Query caching optimization
- [ ] Bundle size analysis
- [ ] Lighthouse audit (if web)

#### 4.3 Testing
- [ ] Unit tests (Jest) for utilities
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests (Detox) for critical flows:
  - [ ] Onboarding flow
  - [ ] Chat flow
  - [ ] Post + Like flow

#### 4.4 Launch Prep
- [ ] App icon + splash screen
- [ ] App Store metadata (if publishing)
- [ ] Crash reporting (Sentry)
- [ ] Analytics (Amplitude/Mixpanel)

---

## 3. Task Dependencies

```
M1 (Foundation)
├── Project Setup
└── Supabase Setup
    └── Auth (depends on Supabase)

M2 (Core MVP)
├── Onboarding (depends on M1)
├── Profile Page (depends on Onboarding)
└── Chat (depends on M1 + Profile data)

M3 (Social)
├── Feed (depends on M2)
├── Follow System (depends on M2)
├── Posts (depends on Feed UI)
└── Image Gen (depends on M2 + Nano)

M4 (Polish)
├── UI Polish (depends on M2+M3)
├── Testing (depends on M2+M3)
└── Launch Prep (depends on Testing)
```

---

## 4. Technical Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-02 | React Native + Expo | Mobile-first, faster development |
| 2026-02-02 | Supabase | Auth + DB + Realtime + Storage in one |
| 2026-02-02 | OpenRouter Preset | Flexibility to change AI without app updates |
| 2026-02-02 | React Query + Zustand | Caching + state management |
| 2026-02-02 | Nano (primary) + DALL-E (fallback) | Per spec, cost control |

---

## 5. API Endpoints (Draft)

### Auth
```
POST /auth/signup
POST /auth/login
POST /auth/logout
GET /auth/session
```

### Pals
```
GET /pals/:id
POST /pals (create)
PUT /pals/:id (update)
GET /pals (list all for explore)
```

### Chat
```
GET /pals/:id/messages
POST /pals/:id/messages
```

### Posts
```
GET /posts (feed)
GET /posts/:id
POST /posts (create)
DELETE /posts/:id
```

### Interactions
```
POST /posts/:id/like
DELETE /posts/:id/like
POST /posts/:id/comments
POST /pals/:id/follow
DELETE /pals/:id/follow
```

---

## 6. Open Questions to Resolve

| Question | Owner | Deadline |
|----------|-------|----------|
| OpenRouter preset model selection | Chris | Before M2 |
| Nano API integration timeline | Chris | Before M3 |
| Image generation fallback (DALL-E vs SD) | Chris | Before M3 |
| Social feed algorithm (chrono vs algo) | Chris | M3 |
| Content moderation strategy | Chris | M3 |

---

## 7. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI API costs exceed budget | Medium | High | Set usage limits, Nano fallback |
| Image generation quality issues | Medium | Medium | User can retry, DALL-E fallback |
| Realtime performance issues | Low | Medium | Optimize queries, pagination |
| App Store rejection (AI content) | Low | Medium | Review guidelines, age gating |

---

## 8. Resources

### Documentation
- [PRD](./prd.md)
- [API Schema] (TBD)
- [Design Mockups] (TBD)

### Tools
- Figma (design)
- Notion (documentation)
- GitHub Issues (task tracking)
- Expo Doctor (health checks)

---

*Plan to be updated as project evolves.*
