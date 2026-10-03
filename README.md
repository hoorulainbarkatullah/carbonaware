# CarbonAware

CarbonAware is a sustainability web app built with Next.js. Users can calculate their monthly carbon footprint (transport + food), view their history, get AI-generated reduction recommendations, take quiz challenges for points, XP and badges, follow a learning hub, and post in a community Q&A forum. Admins and managers get an admin control panel for users, topics and challenges.

The **public website** (landing page) and the **dashboard / admin panel** live in **one Next.js app**, with **one set of API routes** and **one MongoDB database**. They are not separate projects or services.

> This README was produced by reading the code at commit `6323677`. Anything that could not be confirmed from the code is marked **Needs verification**. Re-check the relevant files before you change code.

---

## 1. Tech stack

| Area | Technology (from `package.json`) |
|---|---|
| Framework | Next.js `16.2.9` (App Router, `src/app`) |
| UI | React `19.2.4`, Tailwind CSS v4 (`@tailwindcss/postcss`), `framer-motion`, `lucide-react` icons |
| Language | TypeScript 5 (`strict: true`, path alias `@/*` → `./src/*`) |
| Database | MongoDB, accessed through **both** Prisma `6.4` (`@prisma/client`) **and** the native `mongodb` driver `7.x` |
| AI | Groq (Llama 3.3 70B / Llama 3.1 8B) and Google Gemini, called over plain `fetch` (no SDK) |
| Weather | OpenWeatherMap current-weather API (optional; falls back to a mock) |
| Lint | ESLint 9 with `eslint-config-next` (core-web-vitals + typescript) |

> `AGENTS.md` / `CLAUDE.md` warn that this Next.js version has breaking changes compared with older versions. Read `node_modules/next/dist/docs/` before you write code. One example already in use: dynamic route `params` is a `Promise` (see `src/app/api/questions/[id]/route.ts`).

---

## 2. Repository structure

```
carbonaware/
├── AGENTS.md / CLAUDE.md        # Agent instructions (Next.js version warning)
├── next.config.ts               # Empty config (comment mentions Vercel)
├── eslint.config.mjs
├── postcss.config.mjs           # Tailwind v4 PostCSS plugin
├── tsconfig.json
├── prisma/
│   └── schema.prisma            # MongoDB data models (Prisma)
├── public/                      # Images (logo, hero/CTA illustrations, dashboard images)
├── scripts/
│   ├── seed-admin.mjs           # Creates/updates admin@gmail.com (HARDCODED DB URI, see §18)
│   └── consolidate-users.mjs    # Migrates legacy "User" collection → "users" (HARDCODED DB URI)
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout, Geist fonts, SEO metadata
    │   ├── globals.css          # Tailwind import + @theme color tokens
    │   ├── page.tsx             # Landing page (public website)
    │   ├── page.module.css      # Leftover create-next-app CSS module (not imported)
    │   ├── signin/page.tsx      # Sign-in page
    │   ├── signup/page.tsx      # Sign-up page
    │   ├── dashboard/           # Authenticated area (client-side guarded)
    │   │   ├── layout.tsx       # Sidebar, header, notifications, auth guard
    │   │   ├── page.tsx         # User dashboard overview
    │   │   ├── calculator/      # Carbon calculator (transport + food)
    │   │   ├── history/         # Calculation history + analytics
    │   │   ├── recommendations/ # AI recommendations
    │   │   ├── challenges/      # Quiz challenges, badges, leaderboard
    │   │   ├── learning/        # Learning hub (topics, lessons, discussions)
    │   │   ├── community/       # Community Q&A forum
    │   │   ├── settings/        # Profile + carbon goal
    │   │   ├── admin/           # Admin control panel
    │   │   └── insights/        # "Insights (For Orgs)" – static demo data
    │   └── api/                 # Route handlers (backend), see §10
    ├── components/              # Landing page components
    └── lib/                     # Prisma/Mongo clients, calculator logic, seed/fix scripts
```

---

## 3. Main website (landing page) architecture

- **Route:** `/` → `src/app/page.tsx` (server component). It renders `Navbar`, `Hero`, `Features` and `Footer`.
- **Sections and anchors:** `#home` (Hero) and `#overview`, `#features`, `#why-choose-us`, `#impact` (all in `Features`). `Navbar` scrolls smoothly to these anchors.
- **Auth awareness:** `Navbar` (client component) reads `localStorage.user`. If a user is found it shows Dashboard/Settings links and a logout button; otherwise it shows Sign In / Sign Up.
- **Links into the dashboard:** `Hero`, `Features` and `Footer` link directly to `/dashboard/*` routes. If no user is in `localStorage`, the dashboard layout redirects to `/signin`.
- **Unused components:** `CTA.tsx`, `HowItWorks.tsx`, `Stats.tsx` and `about-us.tsx` exist in `src/components/` but no file imports them.
- **Styling:** Tailwind v4 utility classes. Theme tokens (`--color-primary: #16a34a`, etc.) are defined with `@theme` in `globals.css`.

---

## 4. Dashboard architecture

- **Shell:** `src/app/dashboard/layout.tsx` (`"use client"`) wraps every `/dashboard/*` page. It provides:
  - **Client-side auth guard:** if `localStorage.user` is missing or invalid, it calls `router.replace("/signin")`.
  - A **role-based sidebar**:
    - **Admin/manager** (`role === "admin"`, `role === "manager"`, or an email containing `"admin"`): Admin Control Panel, Insights (For Orgs), Settings.
    - **Regular user:** Dashboard, Calculator, History, AI Recommendations, Challenges, Learning Hub, Community, Settings.
  - **Admin auto-redirect:** an admin landing on `/dashboard` is sent to `/dashboard/admin`.
  - **Header:** live points (`/api/dashboard/stats`), weather (`/api/weather`), a notifications dropdown (`/api/user/notifications`), a profile menu and logout. Logout removes `localStorage.user`.
  - **Cross-page refresh:** the layout listens for a window `userUpdated` event. The calculator, learning, challenges and settings pages dispatch this event after they change data, which makes the header reload points and notifications.
- **Pages:** every dashboard page is a client component. Each reads `localStorage.user` and passes `user.id || user.email` as `userId` to the API.
- **Admin panel** (`/dashboard/admin`) has tabs for overview, users, topics and challenges.
  - It loads data from `/api/admin/stats`, `/api/topics` and `/api/challenges`.
  - It can create topics, approve or suspend users, and change user roles (user ↔ manager).
  - A `manager` sees roles read-only and cannot use the status actions.
- **Insights** (`/dashboard/insights`): only hardcoded demo data (departments, carbon offsets). It makes no API calls.

---

## 5. Backend / API architecture

- The backend is made up of **Next.js Route Handlers** under `src/app/api/**/route.ts`. There is no separate server.
- **Two database access layers are mixed:**
  - `src/lib/prisma.ts`: a Prisma client singleton, cached on `globalThis` outside production.
  - `src/lib/mongodb.ts`: a native `MongoClient` promise, cached globally in development. Every caller uses the hardcoded database name `client.db("carbon_aware")`.
  - The **auth routes, admin user list, leaderboards and challenge point updates** use the native driver on the `users` collection. Everything else mostly uses Prisma.
- `src/lib/db-utils.ts` exports `isValidObjectId()` and `buildUserWhereClause()`. Because a `userId` can be either a Mongo ObjectId or an email, these helpers build a safe query and avoid Prisma P2023 (malformed ObjectId) errors.
- `src/lib/calculator.ts` holds input validation and emission formulas:
  - **Transport:** kg CO₂/km by mode and fuel × distance × trips/week × 4.33 → tons per month.
  - **Food:** a base value by diet × a meals factor × a local-food reduction × a waste multiplier ± a waste-management adjustment → tons per month.
- **Many routes seed themselves on first read.** `GET /api/topics` creates 5 default topics if there are none. `GET /api/topics/lessons` creates 3 default lessons for a topic. `GET /api/dashboard/stats` recreates the 4 standard badges if fewer than 4 exist.
- Most routes default `userId` to `"demo-user"` when none is sent.
- **No route verifies the caller's identity** (see §7 and §18).

---

## 6. Database structure

MongoDB holds all data. The schema is in `prisma/schema.prisma` (`provider = "mongodb"`, `url = env("DATABASE_URL")`). Relations are **not** declared; models refer to each other through plain `String` ID fields (`userId`, `challengeId`, `topicId`, `questionId`).

| Model | Collection | Purpose / key fields |
|---|---|---|
| `User` | `users` (`@@map`) | name, email (unique), `passwordHash` (SHA-256), location, carbonGoal, points, streak, xp, level, `role` (`user`/`admin`, plus `manager` in the UI), `status` (`approved`/`suspended`/`pending`). The native driver also writes `loginCount`, which is **not** in the Prisma schema. |
| `CarbonCalculation` | `CarbonCalculation` | userId, transport/food/total emission (tons/month), raw `transportData`/`foodData` JSON |
| `Notification` | `Notification` | userId, title, message, read |
| `Challenge` | `Challenge` | title, description, difficulty, category, rewardPoints, xpReward, badgeReward, totalQuestions, passingScore, deadline (a free-text string), status, isFeatured |
| `ChallengeQuestion` | `ChallengeQuestion` | challengeId, question, options[], correctIndex, explanation |
| `ChallengeAttempt` | `ChallengeAttempt` | userId, challengeId, score, passed, answers[], earnedPoints, earnedXp |
| `UserChallengeProgress` | `UserChallengeProgress` | userId, challengeId, completedQuestions, score, isCompleted, attempts |
| `Badge` | `Badge` | name (unique), description, scoreReq, icon, color |
| `UserBadge` | `UserBadge` | userId, badgeId, earnedDate, unlockedAt |
| `UserLearningProgress` | `UserLearningProgress` | userId (unique), counts, progressPercentage, completedTopicIds[], completedLessonIds[] |
| `LearningTopic` | `LearningTopic` | title, slug (unique), description, lessonsCount, category, icon, discussionsCount |
| `Lesson` | `Lesson` | topicId, title, content, duration, order, points |
| `Question` | `Question` | community/learning-hub post: title, description, author, userId, likedBy[], topic, likes, replies, views, solved |
| `Answer` | `Answer` | questionId, author, userId, content |
| `Certificate` | `Certificate` | userId, title, topicId (issued when a topic is completed) |
| `CommunityLeaderboard` | `CommunityLeaderboard` | defined in the schema; no code uses it |
| `Recommendation` | `Recommendation` | userId, title, category, description, co2Savings, status. Rows are created by `POST /api/calculator` on completion and read by `/api/dashboard/stats`. |

Collection names without `@@map` follow Prisma's default (the model name). That is consistent with the legacy-collection note in `scripts/consolidate-users.mjs`.

---

## 7. Authentication flow

There are **no sessions, cookies, JWTs or middleware**. Authentication happens entirely on the client:

1. **Sign up** (`/signup` → `POST /api/auth/signup`). The route inserts a user into `users` with a SHA-256 password hash (unsalted). It sets `role = "admin"` if the email **contains "admin"**, otherwise `"user"`, and sets `status = "approved"`.
2. **Sign in** (`/signin` → `POST /api/auth/signin`). The route finds the user by lowercased email, compares the SHA-256 hash, rejects `status === "suspended"` with a 403, and increments `loginCount`.
3. Both routes return a `user` object (`id, name, email, role, location, carbonGoal, loginCount, isFirstLogin`). The page stores it as **`localStorage.user`** and navigates to `/dashboard`.
4. The dashboard layout treats any parsable `localStorage.user` as logged in. Admin/manager menus are chosen from `role` or from the email containing "admin".
5. Logout removes `localStorage.user`.
6. **Seeding an admin:** `node scripts/seed-admin.mjs` creates or updates `admin@gmail.com` with password `admin` and role `admin`. The script uses a hardcoded connection string (see §18).

> The API trusts whatever `userId` the client sends. Admin routes have no server-side role check.

---

## 8. Important routes / pages

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Public landing page |
| `/signin` | `app/signin/page.tsx` | Links to `/forgot-password` and `/signup` |
| `/signup` | `app/signup/page.tsx` | Links to `/terms`, `/privacy` and `/signin` |
| `/dashboard` | `app/dashboard/page.tsx` | Overview: emissions, charts, badges, leaderboard, recommendations, challenges, learning widget |
| `/dashboard/calculator` | `.../calculator/page.tsx` | Transport and food tabs. You can calculate each one separately, then "complete" |
| `/dashboard/history` | `.../history/page.tsx` | Paginated history, search/filter, trend and breakdown |
| `/dashboard/recommendations` | `.../recommendations/page.tsx` | AI recommendations; a dismissed card is replaced through `replaceOne` |
| `/dashboard/challenges` | `.../challenges/page.tsx` | Active/completed/leaderboard tabs, quiz modal |
| `/dashboard/learning` | `.../learning/page.tsx` | Topics, lessons, progress, discussions |
| `/dashboard/community` | `.../community/page.tsx` | Q&A: Recent/Trending/Unanswered/My Activity |
| `/dashboard/settings` | `.../settings/page.tsx` | Name, location, carbon goal |
| `/dashboard/admin` | `.../admin/page.tsx` | Admin control panel |
| `/dashboard/insights` | `.../insights/page.tsx` | Static org insights demo |

**Linked routes that do not exist:** `/forgot-password`, `/terms`, `/privacy`, and `/dashboard/ai-recommendations` (linked from `Features.tsx` and `Footer.tsx`; the real route is `/dashboard/recommendations`).

---

## 9. Important components / modules

- `src/components/Navbar.tsx`: landing navbar, anchor scrolling, auth-aware buttons, logout.
- `src/components/Hero.tsx`, `Features.tsx`, `Footer.tsx`: the landing page sections.
- `src/app/dashboard/layout.tsx`: dashboard shell and auth guard (see §4).
- `src/lib/calculator.ts`: validation and emission formulas.
- `src/lib/prisma.ts`, `src/lib/mongodb.ts`: database clients.
- `src/lib/db-utils.ts`: ObjectId/email user lookup helpers.
- `src/lib/seedChallenges.ts`: seeds default badges (70/80/90/100 thresholds) and challenges with questions. No npm script runs it; running it requires a TypeScript runner such as `npx tsx src/lib/seedChallenges.ts` (Needs verification).
- `src/lib/fixChallenges.ts`, `src/lib/fixUserBadges.ts`: one-off data repair scripts. They are not wired to npm scripts either (Needs verification).

---

## 10. API endpoints and integrations

| Method & path | DB layer | Purpose |
|---|---|---|
| `POST /api/auth/signup` | mongodb | Create user `{name, email, password}` |
| `POST /api/auth/signin` | mongodb | Log in `{email, password}` |
| `POST /api/calculator` | Prisma | `action: "transport" \| "food" \| "complete"` with `userId`, `transportData`, `foodData`, `calculationId`. On `complete` it adds +50 points, a notification and a `Recommendation` row |
| `GET /api/calculator/latest?userId=` | Prisma | Latest calculation (not called by any page) |
| `GET /api/calculator/history?userId=&page=&limit=&search=` | Prisma | Paginated history + analytics |
| `GET /api/dashboard/stats?userId=` | both | Dashboard aggregate (emissions, badges, leaderboard, recs, challenges, learning) |
| `POST /api/ai/recommendations` | Prisma | `action: "generate"` (default) or `"replaceOne"`. Tries Groq, then Gemini, then a built-in rule-based pool. Generated results are **not saved** |
| `GET /api/challenges?userId=[&challengeId=]` | both | Challenges, progress, badges, leaderboard; with `challengeId`, that challenge's questions |
| `POST /api/challenges` | both | Submit a quiz `{userId, challengeId, score, userAnswers}`. Awards points/XP/level (level = ⌊xp/500⌋+1), a badge and a notification |
| `GET /api/topics?search=` / `POST /api/topics` | Prisma | List topics (seeds defaults when empty) / create a topic |
| `GET /api/topics/lessons?topicId=` | Prisma | Lessons for a topic (seeds defaults when empty) |
| `GET /api/learning-progress?userId=` / `POST` | both | Progress + top-5 highlights / `action: "complete_lesson"` (+20 pts) or `"complete_topic"` (+50 pts + certificate) |
| `GET /api/questions?tab=&search=&userId=` / `POST` | Prisma | List / create a forum post (+25 pts when `userId` is set) |
| `GET/PUT/DELETE /api/questions/[id]` | Prisma | Fetch with answers / `toggle_like`, `add_comment`, `edit_question` (otherwise **writes the raw body**) / delete |
| `GET` or `DELETE /api/questions/delete-dummies` | Prisma | Deletes seeded posts by 4 hardcoded author names |
| `GET /api/user/settings?email=` / `PUT` | Prisma | Read / update profile (creates a user if one is missing) |
| `GET /api/user/notifications?userId=` / `PUT` | Prisma | Latest 10 (returns mock data when none exist) / mark all as read |
| `GET /api/admin/stats` / `POST` | both | All non-admin users + counts / `{targetUserId, action: "suspend"\|"approve"\|"changeRole", newRole}` |
| `GET /api/weather?location=` | none | OpenWeatherMap when a key is set, otherwise a mock temperature by city |

**External integrations**

- **Groq:** `https://api.groq.com/openai/v1/chat/completions`, models `llama-3.3-70b-versatile` and then `llama-3.1-8b-instant`.
- **Google Gemini:** `generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`. `generate` tries `gemini-1.5-flash`, `gemini-2.0-flash` and `gemini-2.5-flash`; `replaceOne` uses `gemini-1.5-flash`. Whether these models are still available is Needs verification.
- **OpenWeatherMap:** `api.openweathermap.org/data/2.5/weather` (metric units).

---

## 11. Environment variables

No `.env` file is committed (`.gitignore` ignores `.env*`). Create `.env` or `.env.local` in the project root:

| Variable | Required | Used in | Notes |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `prisma/schema.prisma`, `src/lib/mongodb.ts` | MongoDB connection string. Prisma uses the database named in the URL, while the native driver always uses `carbon_aware`. Include `/carbon_aware` in the URL so both layers use the same database. |
| `GROQ_API_KEY` | Optional | `api/ai/recommendations` | Groq key. |
| `GEMINI_API_KEY` | Optional | `api/ai/recommendations` | Gemini key. If its value starts with `gsk_`, it is treated as a **Groq** key. |
| `WEATHER_API_KEY` | Optional | `api/weather` | OpenWeatherMap key; without it the route returns mock weather. |
| `NODE_ENV` | Automatic | prisma/mongodb clients | Set by Next.js. |

Example:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/carbon_aware?retryWrites=true&w=majority"
GROQ_API_KEY=""
GEMINI_API_KEY=""
WEATHER_API_KEY=""
```

---

## 12. Installation / setup

Prerequisites: Node.js and npm. The exact Node version is not pinned (Needs verification); Next 16 requires a recent Node LTS.

```bash
npm install                 # installs from package-lock.json
npx prisma generate         # REQUIRED: there is no postinstall script that generates the Prisma client
# create .env with DATABASE_URL (see §11)
```

Optional:

```bash
npx prisma db push          # sync indexes (e.g. unique email/slug) to MongoDB (Needs verification for your DB)
node scripts/seed-admin.mjs # creates admin@gmail.com / admin. Uses a HARDCODED URI, not DATABASE_URL
npx tsx src/lib/seedChallenges.ts   # seed challenges/badges (tsx is not a dependency; Needs verification)
```

---

## 13. Development commands

```bash
npm run dev     # next dev → http://localhost:3000
npm run lint    # eslint
```

## 14. Build commands

```bash
npm run build   # next build
npm run start   # next start (serves the production build)
```

The Prisma client must be generated before you build. The build script does not run `prisma generate`.

---

## 15. Deployment

- `next.config.ts` is empty apart from the comment `/* Vercel standard serverless build config */`, which suggests the target is **Vercel**. There is no `vercel.json`, Dockerfile or CI config in the repo, so the actual hosting is **Needs verification**.
- On any host, set `DATABASE_URL` (and the optional keys) and make sure `prisma generate` runs at build time, for example with a `postinstall` script or a custom build command. **Needs verification** of how the current deployment handles this.

---

## 16. Important dependencies

- `next`, `react`, `react-dom`: the framework.
- `@prisma/client` and `prisma`: ORM for MongoDB. Both are in `dependencies`.
- `mongodb`: native driver, used alongside Prisma.
- `framer-motion`: animations in the dashboard and landing pages.
- `lucide-react`: icons.
- `tailwindcss` v4 and `@tailwindcss/postcss`: styling.
- Node's built-in `crypto`: SHA-256 password hashing.

---

## 17. How the website and dashboard are connected

- They are the **same Next.js app** on the same origin. The landing page links to `/signin`, `/signup` and `/dashboard/*` with `next/link`.
- **Shared state is `localStorage.user`**:
  - written by `/signin` and `/signup` (and updated by `/dashboard/settings`),
  - read by the landing `Navbar` and every dashboard page,
  - cleared on logout from either the Navbar or the dashboard.
- Both parts call the same `/api/*` route handlers, which use the same MongoDB database.
- Inside the dashboard, pages signal the layout to refresh the header with `window.dispatchEvent(new Event("userUpdated"))`.

---

## 18. Important notes and potential issues found during inspection

**Security (high priority)**

1. **Database credentials are committed.** `scripts/seed-admin.mjs` and `scripts/consolidate-users.mjs` contain a full MongoDB Atlas connection string with a username and password. They are also in git history. Rotate the password and move the URI into `DATABASE_URL`.
2. **No server-side authentication or authorization.** Every API trusts the `userId`/`email` the client sends. In particular:
   - `GET /api/admin/stats` returns every user's data to any caller.
   - `POST /api/admin/stats` lets anyone suspend, approve or change the role of any user.
   - `POST /api/topics` and `/api/questions/delete-dummies` are unprotected.
3. **Admin role from email.** Signing up with any email that contains "admin" gives `role: "admin"`, and the UI also treats such emails as admin.
4. **Weak password hashing.** Passwords use unsalted SHA-256, not bcrypt or argon2.
5. **Default admin credentials:** `admin@gmail.com` / `admin` (from `seed-admin.mjs`).
6. **Writes the raw request body.** `PUT /api/questions/[id]` with an unknown `action` calls `question.update({ data: body })`. A caller could set any field, or the update could fail on unknown keys.
7. **Ownership checks can be skipped.** `DELETE /api/questions/[id]` checks ownership only when `userId` is passed, so omitting it allows deleting any post. `edit_question` allows editing posts that have no `userId`.
8. **Clients can award themselves points.** Quiz `score` comes from the client and is not checked against `correctIndex`.

**Functional bugs / inconsistencies**

9. **Admin "Create Challenge" always fails.** `admin/page.tsx` sends `POST /api/challenges` with `action: "create"` and no `challengeId`. The route has no create action and returns 400 "Missing required parameters".
10. **Broken links:** `/dashboard/ai-recommendations`, `/forgot-password`, `/terms`, `/privacy` (§8).
11. **Badge thresholds differ in two places.** `seedChallenges.ts` seeds badges at 70/80/90/100% score. `/api/dashboard/stats` and `/api/challenges` use hardcoded 30/60/80/90% completion badges (ids `b1`–`b4`). `dashboard/stats` also **deletes all badges** and reseeds them whenever fewer than 4 exist.
12. **Two data-access layers on the same `users` collection.** The native driver writes fields Prisma does not know about (`loginCount`) and uses a hardcoded DB name. Prisma `User` defaults (`points 1280`, `streak 3`, `xp 450`) differ from signup's values (0). Fallbacks in some routes return 1280 points.
13. **`userId` is sometimes an email and sometimes an ObjectId.** `localStorage.user.id || email` is used throughout, and the routes query several `OR` combinations to cope. Records may be stored under either form.
14. **Demo fallbacks:**
    - The default `userId` is `"demo-user"`.
    - Notifications return 3 mock items when the user has none.
    - The challenges progress default shows `3/10` and score `85` when there is no progress record.
    - History `totalCarbonSavedKg` is `logs × 170`.
    - The dashboard's initial state shows "Ali Khan" and sample numbers until data loads.
15. **Settings that are not saved:** `notifyLimit`, `weeklyDigest` and `showLeaderboard` are sent to `PUT /api/user/settings`, but the route ignores them.
16. **Leaderboard filters are ignored:** the `timeframe` parameters are accepted but never used.
17. **AI recommendations are generated on every request.** They are not stored, so completed or dismissed state lives only in the page's React state. They are also separate from the `Recommendation` rows that `/api/calculator` creates.
18. **Unused code:** `CTA`, `HowItWorks`, `Stats` and `about-us` components, `page.module.css`, the `CommunityLeaderboard` model, and `/api/calculator/latest`.
19. **Duplicate UI:** `learning/page.tsx` and `community/page.tsx` both contain the full question CRUD and comment UI.
20. **Type checking is mostly bypassed:** there are many `(prisma as any)` casts and `any` types. `ignoreBuildErrors` is not set, so `next build` type-checks; whether it currently passes is Needs verification (dependencies were not installed during inspection).
21. **Learning progress uses fixed totals:** the percentage assumes 15 lessons in total. Certificate titles use the topic count.

---

## Working on this codebase

Before you change code:
- read the files you plan to touch and the related API route(s),
- check `node_modules/next/dist/docs/` for the Next.js 16 API in question,
- remember that both Prisma and the native `mongodb` driver touch the same collections.
