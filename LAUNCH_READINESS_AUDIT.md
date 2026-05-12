# GuildForge — Launch Readiness Audit

> Gap analysis: what exists, what's a placeholder, and what must be fixed before real users can touch this.

---

## 🟢 What's Actually Working (Real Code, No Stubs)

| Layer | Feature | Status |
|---|---|---|
| **Auth** | Discord OAuth2 flow (Arctic + Lucia sessions) | ✅ Real |
| **Auth** | Session validation, `/auth/me`, `/auth/logout` | ✅ Real |
| **DB** | Prisma schema (User, Session, OAuthAccount, ManagedGuild, Conversation, Message, BuildPlan, Operation, SnapshotRecord) | ✅ Real |
| **API** | `GET /guilds/` — fetches user's Discord guilds, flags bot presence | ✅ Real |
| **API** | `POST /guilds/:id/connect` — upserts ManagedGuild in DB | ✅ Real |
| **API** | `POST /guilds/:id/audit` — AI generates structural recommendations | ✅ Real |
| **API** | Conversation create, message send, plan generate | ✅ Real |
| **API** | `POST /plans/:id/execute` — SSE-streamed full build via MCP | ✅ Real |
| **API** | `POST /plans/:id/rollback` — finds latest snapshot, calls restore | ✅ Real |
| **MCP** | 20+ Discord tools: create_category, create_text_channel, create_voice_channel, create_forum_channel, create_role, update_permissions, configure_automod, create_webhook, send_embed, snapshot_guild, restore_snapshot, post_bot_invite_panel, export_guild_to_plan | ✅ Real |
| **Executor** | Full 9-phase execution with safeCall retry logic, SSE streaming, DB operation logging | ✅ Real |
| **AI** | AnthropicProvider (generate + chat), structured tool-use plan generation | ✅ Real |
| **Frontend** | Landing page (feature list, pricing, FAQ, footer) | ✅ Real |
| **Frontend** | PreviewTree with framer-motion animations, glassmorphism | ✅ Real |
| **Frontend** | ChatPanel (messages, loading, send on Enter) | ✅ Real |
| **Frontend** | BotSetupPanel (bot cards, invite links, setup steps, checkbox tracking) | ✅ Real |
| **Frontend** | Execution Theater (animated terminal, SSE parsing, color-coded phases) | ✅ Real |
| **Infra** | docker-compose (postgres, redis, api, web) | ✅ Real |
| **Infra** | CORS, cookie handling, Fastify logger | ✅ Real |

---

## 🔴 Critical Blockers — App Cannot Launch Without These

### 1. Dashboard Page is a Stub
**File:** `apps/web/src/app/dashboard/page.tsx`

The entire dashboard — the page every user lands on after login — is a hardcoded placeholder:
```tsx
// Placeholder for TanStack query + actual fetching
<h2>Loading guilds...</h2>  // ← static string, never loads anything
```
**What's needed:**
- Fetch `GET /guilds/` from the API using the session cookie.
- Render a grid of guild cards (icon, name, member count, "Open" or "Invite Bot" CTA).
- Handle the `botPresent: false` case by showing an "Add GuildForge Bot →" button with the `inviteUrlIfMissing`.
- Handle loading skeleton and error states.

---

### 2. No Route from Dashboard → Onboarding → Planning
There is no navigation flow connecting:
- Dashboard (guild selector) → `POST /guilds/:id/connect` → onboarding → `POST /conversations` → `/dashboard/:guildId/plan/:conversationId`

The onboarding wizard (`/dashboard/[guildId]/onboarding/page.tsx`) exists and has all the form steps (Purpose, Audience, Branding, Size, Roles, Topics, CoreNeeds, Review), but **nothing on the dashboard actually navigates to it**. The wizard also has no submit handler that calls the API to create a conversation. The user has literally no path from login to the builder.

**What's needed:**
- Dashboard guild card → click → `POST /guilds/:id/connect` → redirect to `/dashboard/:guildId/onboarding`
- Onboarding `StepReview` final submit → `POST /conversations` → redirect to `/dashboard/:guildId/plan/:conversationId`

---

### 3. Plan Execution Page Has No Auth — Hardcoded localhost
**File:** `apps/web/src/app/dashboard/[guildId]/plan/[conversationId]/page.tsx`

Every `fetch()` call is hardcoded to `http://localhost:3001`. This means:
- It breaks in production entirely.
- It cannot send session cookies cross-origin (needs `credentials: 'include'`).
- The `EventSource` SSE connection also hardcodes localhost.

**What's needed:**
- Replace all `http://localhost:3001` with `process.env.NEXT_PUBLIC_API_URL`.
- Add `credentials: 'include'` to every `fetch()` call.
- Fix the `EventSource` URL similarly.

---

### 4. No Auth Guard on Any Frontend Route
Any unauthenticated user can navigate to `/dashboard` or `/dashboard/xyz/plan/abc` — the page will just crash with fetch errors. There is zero middleware protecting the dashboard routes.

**What's needed:**
- A Next.js middleware (`middleware.ts`) or layout-level `useEffect` that checks `/auth/me` and redirects to `/login` if the user is not authenticated.

---

### 5. OAuth Token Expiry — No Refresh
**File:** `apps/api/src/routes/guilds.ts`

The API fetches Discord guilds using the stored `accessToken`, but Discord OAuth tokens expire in 7 days. There's no refresh logic:
```ts
if (res.status === 401) {
  throw new Error("Token expired");  // ← throws, no recovery
}
```
**What's needed:**
- When a 401 is received, use `refreshToken` with Arctic's `discordAuth.refreshAccessToken()` to get a new token, update the DB, and retry the request.

---

### 6. Missing `.env.example` File
There is no `.env.example` in the repo. Anyone cloning it has zero documentation on what environment variables are required. The `env.ts` schema defines them, but no developer can discover them without reading source code.

**What's needed:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guildforge
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
ANTHROPIC_API_KEY=
SESSION_SECRET=
WEB_URL=http://localhost:3000
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### 7. Missing `apps/api/Dockerfile` and `apps/web/Dockerfile`
`docker-compose.yml` references `apps/api/Dockerfile` and `apps/web/Dockerfile`, but neither file exists. Running `docker compose up` fails immediately.

---

### 8. Conversation Flow — No Initial Chat Message
When the planning page loads, the conversation history may be empty and the user stares at a blank chat. There's no initial "Hi, I'm GuildForge! Tell me about your server" greeting, making the UX feel dead on arrival. The AI only speaks when the user speaks first.

**What's needed:**
- On conversation create (`POST /conversations`), the API should insert an initial assistant greeting message before returning.

---

## 🟡 Significant Issues — Will Hurt Real Users

### 9. The PreviewTree Doesn't Show Changes as the AI Generates
The current `PreviewTree` renders a complete static `BuildPlan`. The plan is only generated after the onboarding wizard submits. There's no streaming/progressive reveal while the plan is generating. Users wait with no feedback.

### 10. `diff_snapshot_vs_current` is Unimplemented
**File:** `apps/mcp-discord/src/tools/snapshots.ts`
```ts
return { message: "Diffing not fully implemented yet." }; // dead stub
```
This is the entire restoration safety guarantee. The "Self-Healing" feature and rollback correctness both depend on this.

### 11. `restore_snapshot` is Unimplemented
```ts
throw new Error("Restore logic is complex and needs more implementation");
```
The rollback API endpoint (`POST /plans/:id/rollback`) calls this and will always throw. Rollback is a core feature advertised prominently in the README and landing page FAQ.

### 12. `plans.ts` Execution Route Doesn't Validate Authorization
`POST /plans/:id/execute` checks `if (!request.session)` but doesn't verify the plan belongs to the requesting user. Any authenticated user can execute any plan by guessing IDs.

### 13. `conversations.ts` Missing Auth Guard (Same Issue)
`POST /conversations`, `GET /conversations/:id`, and `POST /conversations/:id/messages` have no `preHandler` hook verifying the user owns the conversation. Any session can access any conversation.

### 14. No Error Boundary in Frontend
If the API is down or returns an error, the Next.js pages crash silently with uncaught promise rejections. No `try/catch` with user-visible error states in the planning page for the initial conversation load.

### 15. `logo.png` Is Missing
The landing page footer and layout reference `/logo.png`. The `apps/web/public/` directory has no such file. The image will 404 and show a broken image icon.

### 16. Token Stored in Plain DB — No Encryption
`OAuthAccount.accessToken` and `refreshToken` are stored as plaintext strings in Postgres. Best practice is to encrypt at rest using a `SESSION_SECRET`-derived key.

---

## 🟠 Quality Issues — Should Fix Before Launch

### 17. Plan Generation Has No Streaming — Long Wait
The AI plan generation (`POST /conversations/:id/generate-plan`) is a synchronous HTTP request that can take 30-90 seconds for a large plan. The frontend just waits. No progress indicator, no streaming, no timeout handling.

### 18. Rate Limiting on API Endpoints
There's no rate limiting on the `/conversations/:id/messages` endpoint. A user (or bot) could spam the Anthropic API, generating thousands of dollars in API costs in minutes.

### 19. Pricing Tiers Have No Logic
The `User.plan` field exists in the DB (`free | pro | studio`), and the landing page shows pricing. But there is zero enforcement of limits anywhere in the code. Free users can run unlimited builds.

### 20. `StepReview` in Onboarding Doesn't Show a Real Preview
The review step shows a static text summary. Ideally it should make a call to pre-generate the plan and show a rough PreviewTree skeleton before the user commits.

### 21. `mcp.ts` Local Fallback Path is Wrong in Production
```ts
const mcpPath = path.resolve(__dirname, "../../../../mcp-discord/src/index.ts");
```
This path only works in a local dev monorepo. In a Docker container or deployed environment, this path doesn't exist. The `MCP_DISCORD_URL` env variable must be set, but there's no documentation, no validation, and no fallback error.

---

## 📋 Launch Checklist (Priority Order)

```
BLOCKERS (must fix first):
[ ] Write apps/web/src/app/dashboard/page.tsx — fetch & render guild cards
[ ] Wire onboarding StepReview → POST /conversations → redirect to plan page  
[ ] Replace all localhost:3001 hardcodes with NEXT_PUBLIC_API_URL
[ ] Add credentials: 'include' to all fetch() calls in the web app
[ ] Create apps/web/src/middleware.ts — auth guard for /dashboard routes
[ ] Implement OAuth token refresh in GET /guilds/
[ ] Create .env.example
[ ] Create apps/api/Dockerfile and apps/web/Dockerfile
[ ] Add initial AI greeting on conversation create
[ ] Add auth ownership check on /plans/:id/execute and /conversations/:id/*

HIGH PRIORITY:
[ ] Implement restore_snapshot tool (actual channel/role recreation logic)
[ ] Implement diff_snapshot_vs_current tool
[ ] Add logo.png to apps/web/public/
[ ] Add rate limiting to AI endpoints (e.g. @fastify/rate-limit)
[ ] Add try/catch + error UI to planning page initial load
[ ] Fix MCP_DISCORD_URL validation and document it in .env.example

LAUNCH POLISH:
[ ] Enforce free tier build limits (check User.plan before executing)
[ ] Add plan generation loading state / skeleton
[ ] Encrypt OAuthAccount tokens at rest
[ ] Add Next.js error boundary components
```

---

## Summary

The backend engine (AI orchestration, MCP tools, executor, auth, DB) is **genuinely impressive and mostly production-grade**. The critical problem is that the **frontend is ~30% wired up**. The dashboard never loads, the onboarding has no submit handler, all API calls are hardcoded to localhost, and there's no auth protection on any page. A new user logging in would hit a static "Loading guilds..." string and have nowhere to go.

The gap is roughly **2-3 focused days of frontend work + 1 day of infra fixes** to go from demo-grade to launch-grade.
