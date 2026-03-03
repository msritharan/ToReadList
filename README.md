# ToReadList

> **Save it now. Read it later.**
>
> A personal read-later system that lets you save links from anywhere — your phone's share menu, a Telegram bot, or a clean web UI — and manage your reading queue in one beautifully organized place.

---

## What Is ToReadList?

ToReadList is a self-hosted reading list manager built for people who constantly stumble upon interesting articles but never have the time to read them *right now*. Instead of losing links in browser tabs or chat threads, ToReadList gives you a single, distraction-free space to collect, organize, and work through your reading backlog.

### How It Works

| Channel | How to Save a Link |
|---|---|
| **iOS / Android** | Install the PWA, then use your phone's native **Share** menu → "ToReadList" to save any link instantly. |
| **Telegram Bot** | Send (or forward) any URL to the bot. It's saved to your list automatically. |
| **Web UI** | Click **Add Link** on the dashboard, paste a URL, and metadata is fetched for you in real time. |

Every link you save gets its **title, description, and favicon** auto-extracted so your list is always rich and scannable without any extra effort.

---

## Features

- **Google OAuth** — Sign in with your Google account. No passwords to manage.
- **PWA with Share Target** — Install on your home screen (iOS & Android) and save links via the native share menu.
- **Telegram Integration** — Connect a Telegram bot and save links by simply messaging them. Scan a QR code or tap a link to connect.
- **Live Metadata Extraction** — Titles, descriptions, and favicons are fetched automatically when you add a link.
- **Smart Filters** — Filter by status (Unread / Read / Skipped), favorites, domain, or tags.
- **Tags** — Organize links with custom tags. Autocomplete makes it fast.
- **Bulk Actions** — Select multiple links and mark as read, delete, or move to trash in one click.
- **Trash & Restore** — Deleted links go to trash first. Restore them or permanently delete.
- **Favorites** — Star your most important links for quick access.
- **Dark & Light Mode** — Automatic theme switching with carefully tuned palettes for both.
- **Responsive Design** — Card-based mobile layout with sort & filter dialogs optimized for small screens.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| Database & Auth | [Supabase](https://supabase.com/) (Postgres, Auth, Row-Level Security) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Data Table | [TanStack Table](https://tanstack.com/table) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| PWA | [@ducanh2912/next-pwa](https://github.com/nicedocs/next-pwa) with custom service worker |
| Bot | Telegram Bot API (webhook-based) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Supabase** project ([create one free](https://supabase.com/dashboard))
- *Optional:* A **Telegram bot** created via [@BotFather](https://t.me/BotFather)

### 1. Clone & Install

```bash
git clone https://github.com/msritharan/to-read-list-app.git
cd toreadlist
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Where to Find It |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key (keep secret!) |
| `TELEGRAM_BOT_TOKEN` | Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token |
| `TELEGRAM_BOT_USERNAME` | The bot username you chose (without the `@`) |
| `TELEGRAM_WEBHOOK_SECRET` | Generate with `openssl rand -hex 32` |

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

### 4. Set Up Telegram (Optional)

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the token into `.env.local`.
2. Deploy the app (or use a tunnel like [ngrok](https://ngrok.com/)) so the webhook endpoint is publicly reachable.
3. Register the webhook with Telegram:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -d "url=https://your-domain.com/api/telegram/webhook" \
     -d "secret_token=<YOUR_WEBHOOK_SECRET>"
   ```
4. In the app, go to **Settings → Channels → Connect Telegram** and scan the QR code or tap the link from your phone.

---

## Project Structure

```
app/
├── api/            # API routes (links CRUD, trash, metadata, telegram, verify)
├── dashboard/      # Main reading list view
├── settings/       # User settings & channel connections
├── trash/          # Trash management
├── add/            # PWA share-target handler
└── page.tsx        # Landing page
components/         # Reusable UI components (data table, dialogs, nav)
lib/                # Supabase clients, utilities
public/             # PWA manifest, service worker, icons
supabase/           # Database migrations
```

---

## License

This project is licensed under the [MIT License](LICENSE) — you're free to use, modify, and distribute it.
