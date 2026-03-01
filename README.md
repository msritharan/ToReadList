# ToReadList

> A personal read-later system: save any link from Telegram (or anywhere), auto-extract metadata, and manage your reading queue through a clean web UI.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** (Postgres, Auth, RLS)
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Table** for data display

## Current Features

- Google OAuth login
- Single-page dashboard ("Collection") with all links
- Inline filter pills: All / Unread / Read / Skipped + Favorites toggle
- Status tags with colored badges
- Context-aware row actions (Mark Read, Skip, Favorite, Delete)
- Add Link dialog with live metadata preview
- Top navbar with user avatar dropdown (Profile, Settings, Sign Out)

---

## Upcoming: Onboarding Flow & Telegram Verification

### Overview

A guided onboarding for new users to connect ingestion channels. Telegram is the first channel, with more planned (Email, Browser Extension).

### Verification Flow (Zero Cost)

Uses a simple `/start` flow — the user messages the bot and their Telegram chat ID is automatically linked to their account.

```
1. User navigates to Settings → Channels → Connect Telegram
2. App shows the bot username and a deep link (t.me/YourBot?start=<token>)
3. User taps the link → opens Telegram → sends /start
4. Bot receives the chat ID + start token, links to user's account
5. Bot replies "✅ Connected!" (free)
6. Web app detects connection and updates the UI
```

### Required Changes

#### Database Migration
Add to `profiles` table:
- `telegram_verified` (boolean, default false)
- `telegram_link_token` (text, nullable)
- `telegram_link_expires_at` (timestamptz, nullable)

#### New API Routes
| Route | Purpose |
|-------|---------|
| `POST /api/verify/start` | Generate link token, store on profile |
| `POST /api/verify/check` | Poll verification status |
| `POST /api/telegram/webhook` | Receive messages, verify tokens, handle links |

#### New Pages
- `/onboarding` — Step-by-step wizard (Welcome → Connect Telegram → Done)
- Skip option available at every step

#### New Environment Variables
```
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
```

### Prerequisites
- A Telegram bot created via @BotFather (free, instant)
- Webhook URL configured via Telegram Bot API
