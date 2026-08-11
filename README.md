# Ernest — Automated Trading Workspace

This repository contains a responsive React recreation of the public landing page supplied at [blueman.site](https://blueman.site), rebranded as **Ernest**. It preserves the reference page’s public composition and behavior: a dark trading-night hero, market ticker, typed headline, status badge, continuously moving workspace activity cards, secure-login link, signup link, and an in-page workspace preview.

The authenticated Ernest workspace is available at `/workspace` in local development and at `/?view=workspace` after production OAuth. It includes the screenshot-defined module shell, account selector and balance sync, public live market streaming, Bot Builder drafts, Free Bots templates, Strategies, Analysis Tools, Charts, D-Trader contract preview, Auto Trader/Bulk Trader/Signals/Matches/Speedbot/Copy Trading safety states, Reports links, execution-bar safeguards, and risk disclosure. Real-money order execution is intentionally not silently simulated; it requires a provider-backed authenticated channel and explicit user review.

## Local development

Install Node.js 22 and pnpm 10, then run:

```bash
pnpm install
pnpm dev
```

For a production build:

```bash
pnpm build
```

The static site is emitted to `dist/public`.

## Vercel hosting

The repository includes `vercel.json`, which tells Vercel to run `pnpm build` and publish `dist/public`. Keep the Vercel project root at the repository root and leave the framework preset as **Other** (or let the configuration file control it). A fresh deployment should serve `dist/public/index.html`, not `dist/index.js`.

## GitHub Pages hosting

Create a GitHub repository, push this project to its `main` branch, and enable **GitHub Actions** as the Pages source under repository settings. The included `.github/workflows/deploy-pages.yml` installs dependencies, builds the site, and deploys `dist/public` automatically on every push to `main`.

The compressed hero background and Ernest mark are stored under `client/public/assets` so GitHub Pages and Vercel can serve them directly. Do not remove those files when uploading the repository.

## Project structure

The frontend lives in `client/src`. `client/src/pages/Home.tsx` contains the landing-page and OAuth behavior, `client/src/pages/Workspace.tsx` contains the authenticated workspace, and `client/src/index.css` contains the visual system and responsive layout. Vercel functions under `api/` proxy Deriv account data and token exchange without exposing provider requests directly from the browser.
