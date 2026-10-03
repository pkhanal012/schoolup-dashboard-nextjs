# SchoolUp — dashboard redesign (Next.js)

Eight screens, one quiet design system. Built with Next.js 16 (App Router),
React 19, Tailwind CSS v4 and lucide icons. No component library — the whole kit
is one file so the system stays legible.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
node preview/build.mjs   # one self-contained HTML file in preview/dist
```

## University logos

The Colleges list shows each school's brand mark, fetched by domain from
[Logo.dev](https://www.logo.dev/docs/logo-images/introduction). Schools are
matched on the `domain` field in `components/app/data.ts`.

The publishable key lives in `.env.local`, which is gitignored — set the same
variable in your deploy environment or logos will silently fall back:

```bash
echo 'NEXT_PUBLIC_LOGO_DEV_TOKEN=pk_your_key_here' > .env.local
```

Requests pass `fallback=404` rather than Logo.dev's own monogram, so a school
with no logo lands on the app's initials tile instead of a third visual style.
The same tile covers a missing key or a failed request, so the list never shows
a broken image.

**Attribution:** Logo.dev's free tier requires a visible link back for
commercial use, which is the `School logos by Logo.dev` line under the list.
Paid plans remove that requirement.

## Campus photos and maps

The college drawer opens with a photo carousel and an OpenStreetMap embed,
driven by `images`, `lat` and `lon` in `components/app/data.ts`.

- **Maps** use OpenStreetMap's `export/embed.html`, which needs no API key. The
  `© OpenStreetMap contributors` credit under each map is required by ODbL.
- **Photos** are currently hot-linked from Wikimedia Commons. That is fine for a
  prototype but **not for production**: Wikimedia's robot policy discourages
  hot-linking, and each photo carries its own CC licence needing per-image
  credit. Before shipping, re-host these (or swap in licensed photography) and
  record the attributions. Swapping the `images` arrays is the only change
  needed — the carousel drops any URL that fails to load.

## Screens

| Route | Screen | States covered |
|---|---|---|
| `/` | Landing page | the sticker-book marketing page |
| `/login`, `/signup` | Log in, sign up | magic link; signup asks name + four questions first |
| `/home` | Today | first run (4-step setup), loading skeletons, in progress |
| `/files` | My files | empty, upload, document review |
| `/colleges` | Colleges | plan filter on/off, no results, empty saved list, row → detail drawer → start application |
| `/scholarships` | Scholarships | eligible-only filter, ineligible row with reason, empty tracking |
| `/applications` | Applications | empty, requirement drawer, submit confirmation |
| `/documents` | Documents | empty, new-document picker, coach checklist |
| `/prep` | Interview prep | baseline empty state, unscored session + retry, mic check |
| `/calendar` | Calendar | empty week, plan-my-week, add block with required title |
| `/settings` | Profile & settings | study plan, notifications, billing, destructive confirm |

The **First run / Loading / In progress** switch in the top bar drives every
screen, so each state is one click away.

## Design system

Tokens live in `app/globals.css` — change them there, nothing else. The static
preview imports that same file, so the two builds can never drift.

- **Ground** `#f6f6f4`, **surface** `#ffffff`, **sunken** `#faf9f7`, **hover** `#f4f3f0`, hairline `#e8e7e3`
- **Ink** `#16150f` / `#5b5952` / `#8a8880` / `#b3b1a8` — four text weights, the last one decorative
- **Accent** `#2f5bff`, used only for the primary path and charts
- **Semantic** good `#14784b`, warn `#8d5c00`, bad `#b03a3a` — state only, never decoration
- Radius 12px, 1px borders, and a four-step shadow scale (`--shadow-1…4`).
  Surfaces lift off the ground by elevation, not by another line.
- Type: **Inter** for text, **Geist Mono** for every number — both self-hosted
  through `next/font`. 26px page title, 13.5px body, 12px meta, tabular figures
  everywhere so columns never shift between states.
- Theme is a class on `<html>`, written by an inline script before first paint,
  so dark users never see a white flash. `.dark` redefines the same tokens.

## Structure

```
app/                     one file per screen, all client components
components/ui/kit.tsx    Button, Panel, Badge, Tabs, Chip, Meter, MetricStrip,
                         EmptyState, Modal, Drawer, Skeleton, Toast, Dropdown
components/app/shell.tsx sidebar + top bar + page header
components/app/data.ts   ALL sample data — swap for your API
components/app/state.tsx the demo state switch
preview/                 esbuild + Tailwind CLI → single-file static build
```

`preview/router.tsx` stands in for `next/link` and `next/navigation` in the
static bundle only; the app itself uses the real Next.js router.
