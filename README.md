# ToReadList

> A personal read-later system: save any link from WhatsApp (or anywhere), auto-extract metadata, and manage your reading queue through a clean web UI.

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

## Upcoming: Onboarding Flow & WhatsApp Verification

### Overview

A guided onboarding for new users to connect ingestion channels. WhatsApp is the first channel, with more planned (Email, Telegram, Browser Extension).

### Verification Flow (Zero Cost)

Uses **reverse verification** — the user sends a code TO the bot (a free service message) instead of the bot sending an OTP (which costs money).

```
1. User enters phone number in the web app
2. App generates a unique 6-character code and displays it
3. User sends the code to the WhatsApp bot number
4. Bot matches the code to the user's account
5. Bot replies "✅ Verified!" (free service message)
6. Web app detects verification and redirects to dashboard
```

### Required Changes

#### Database Migration
Add to `profiles` table:
- `whatsapp_verified` (boolean, default false)
- `verification_code` (text, nullable)
- `verification_expires_at` (timestamptz, nullable)

#### New API Routes
| Route | Purpose |
|-------|---------|
| `POST /api/verify/start` | Generate verification code, store on profile |
| `POST /api/verify/check` | Poll verification status |
| `GET /api/whatsapp/webhook` | Meta webhook challenge response |
| `POST /api/whatsapp/webhook` | Receive messages, verify codes, handle links |

#### New Pages
- `/onboarding` — Step-by-step wizard (Welcome → Phone → Verify → Done)
- Skip option available at every step

#### New Environment Variables
```
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BOT_NUMBER=+1234567890
```

### Prerequisites
- Meta Business Account with WhatsApp Cloud API access
- A dedicated phone number for the bot
- Webhook URL configured in Meta Developer Console
