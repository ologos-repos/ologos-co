# Social media

Channel-ready social copy for Ologos LLC, derived from the site editorial in `src/App.jsx`.

## Source → post mapping

The site is structured in discrete editorial blocks that map cleanly to posts:

| Site block | Social use |
|---|---|
| Hero | Manifesto / intro post |
| The Model | "How Ologos works" (think tank · innovation factory · venture engine) |
| The Process (01–03) | 3-part series or carousel |
| Operating Principles (the six) | 6-part principle series |
| Philosophy / "the name is the thesis" | Thought-leadership posts (sharpest differentiator) |
| Who We Work With | Audience-targeted posts (investors / enterprise / acquirers) |
| Team bios | Leadership spotlights |

## Layout

```
social-media/
└── linkedin/                       # voice: punchy
    ├── launch-sequence.md          # 6 posts to introduce the Page
    └── evergreen/
        ├── operating-principles.md # the six, one post each (weekly series)
        └── thought-leadership.md   # founding thesis + audience posts
```

Other channels (X, etc.) deferred until LinkedIn cadence is proven.

## Browsable preview

`build-preview.mjs` reads the `.md` files and emits `public/marketing/linkedin.html`
(styled cards, per-post char count, copy buttons). It runs as part of `npm run build`,
so the page is regenerated from source on every Pages deploy.

- **Live (after deploy):** https://ologos.co/marketing/linkedin.html — `noindex`, not linked from nav (unlisted, but publicly reachable by URL).
- **Local:** `npm run dev`, then open `/marketing/linkedin.html`.
- The generated HTML is gitignored; the `.md` files are the source of truth.

## Workflow

- Copy is reviewed by JD via the preview page before publishing.
- Posting is manual until the LinkedIn Community Management API token is live; then automated from a poster tool (operating record / token stay in thinx per repo-routing rule).

> Status: LinkedIn content bank drafted (16 posts). Awaiting JD review before publishing.
