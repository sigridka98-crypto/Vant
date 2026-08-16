# GetUpdated

Next.js + Tailwind CSS app for the GetUpdated learning platform, powered by Supabase and prepaid purchase codes.

## Stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- Supabase client helpers
- Single-use purchase-code coin flow
- Cloudflare Workers deployment support

## Routes included

- `/` landing page
- `/login`
- `/dashboard`
- `/cards/[slug]`
- `/wallet`
- `/admin`
- `/admin/codes`

## Local setup

1. Install dependencies
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase keys
4. Run `npm run dev`

## Cloudflare deployment

- `npm run cf:build` to build the Cloudflare Worker bundle
- `npm run cf:preview` to preview the production Worker locally
- `npm run cf:deploy` to deploy with Wrangler/OpenNext

## Current state

This is the first application scaffold:

- Tailwind styling is set up
- The main product pages are in place
- Supabase browser/server helpers are included
- Mock data is being used for now

## Next implementation step

- Create the Supabase schema
- Add authentication and roles
- Wire real data into the pages
