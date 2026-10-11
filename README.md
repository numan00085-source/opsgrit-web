# opsgrit-web

Public frontend for **OpsGrit**, a B2B publication on AI workflows, enterprise automation and operations.

Next.js 15 (App Router) · Tailwind CSS 3 · TypeScript · MDX (file-based content)

## Develop

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Content

Posts are `.mdx` files in `content/posts/`. Frontmatter:

```yaml
---
title: "Post title"
slug: "post-slug"
category: "AI Automation" # AI Automation | Ops Stack | Process SOPs
excerpt: "Short summary"
date: "2026-10-11"
author: "OpsGrit Editorial"
coverImage: "" # optional https URL
featured: false
---
```

New posts are normally committed here by `opsgrit-admin`; each commit triggers a Vercel redeploy.

## Deploy (Vercel)

1. Import this repository in Vercel (framework: Next.js, no build overrides).
2. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` (see `.env.example`).
3. Point your domain at the project.

## Before applying for AdSense

- Replace the placeholder contact email with a real, monitored address.
- Publish enough original, human-reviewed articles (the three included are starter samples).
- Add your AdSense script and an `ads.txt` file in `public/` once approved.
