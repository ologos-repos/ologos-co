# ologos.co

Corporate site for Ologos LLC — a think tank and innovation factory.

Static site built with **Vite + React**, deployed to **GitHub Pages** via GitHub
Actions. Custom domain `ologos.co` (see `public/CNAME`) — DNS points the apex at
GitHub Pages once configured in the domain registrar.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # static build → dist/
npm run preview  # preview the production build
```

## Deploy

Push to `main` → the `Deploy to GitHub Pages` workflow builds and publishes.
Live at https://ologos-repos.github.io/ologos-co/ (and https://ologos.co once DNS
is pointed).

## Structure

- `src/App.jsx` — the single-page app (Home / About / Philosophy / Team / Contact)
- `index.html` — Vite entry
- `public/CNAME` — custom domain for GitHub Pages

## Notes

- The contact form is currently a front-end mock; wire it to a form backend
  (Formspree/Basin) or a mailto before launch.
