# Toolora

Toolora is a responsive collection of 50 browser-based calculators, converters and productivity tools, with a small Express API for health checks.

## Features

- 50 individual, searchable tool routes with formulas, validation and relevant guidance
- Responsive home page, category browsing, favorites and recently used tools
- Browser-stored favorites, recent tools and color theme; calculator and text input is not sent to the API
- Light and dark themes, page metadata, structured data, sitemap and robots file
- Optional QR-code image generation and opt-in Google Analytics
- Express API with Helmet, CORS, rate limiting and an optional Mongoose connection
- No fabricated currency rates: conversion requires a configured trusted provider

## Technology

React, Vite, JavaScript, Tailwind CSS, React Router, Express, Helmet, CORS, express-rate-limit and Mongoose.

## Requirements

- Node.js 20 or later
- npm 10 or later
- MongoDB only if you choose to configure the optional database connection

## Install and run locally

From the repository root:

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

The Vite client runs at <http://localhost:5173>; the API uses port `5000` by default. If that port is already occupied during local development, the server automatically selects an available port and prints it in the terminal. Verify the API at `http://localhost:<printed-port>/api/health`, which returns `{"status":"ok"}`. Set `VITE_API_URL` to that printed port if a client feature needs the API. Production uses the port supplied by the hosting platform and does not silently switch ports.

To run only one service:

```bash
npm run dev:client
npm run dev:server
```

## Environment variables

Copy `.env.example` to `.env` and configure only the values needed for your deployment:

| Variable | Purpose |
| --- | --- |
| `PORT` | Express API port (default `5000`) |
| `CLIENT_ORIGIN` | Allowed client origin for API CORS, such as `https://www.example.com`; comma-separate explicitly allowed origins if needed |
| `MONGODB_URI` | Optional MongoDB connection string. No calculator inputs are stored in MongoDB. |
| `VITE_API_URL` | API base URL for client-side integrations |
| `VITE_GA_ID` | Optional Google Analytics measurement ID. Analytics are disabled when empty. |
| `VITE_CURRENCY_API_URL` | Optional trusted currency-rate endpoint accepting `from` and `to` query parameters and returning JSON such as `{"rates":{"INR":83.1},"date":"2025-01-01"}`. No rates are invented. |
| `VITE_SITE_URL` | Public site origin used when generating the sitemap and robots.txt (default is an example placeholder). |

Never commit `.env` or expose credentials in client-side variables. Any variable prefixed `VITE_` is public in the built website; use it only for non-secret configuration.

## MongoDB setup

MongoDB is optional because the current tools do not need persisted user data. If later server features need a database, create a MongoDB Atlas cluster (or use a local MongoDB instance), set `MONGODB_URI` in the server environment, and restrict database network access and credentials appropriately. The API connects only when this variable is configured.

## Production build and API

```bash
npm run build
npm start
```

The generated frontend files are in `client/dist`. Deploy the client and API as separate services, or configure a hosting platform to serve the static build and route `/api/*` to the Express service. Add SPA fallback/rewrite behavior for client routes such as `/tools/emi-calculator`.

## Deployment

Possible hosting choices include Vercel or Netlify for the static client, Render or Railway for the Express API, and MongoDB Atlas if persistence is later required. These providers may offer free tiers or trials, but availability, limits and pricing can change; do not assume any service is permanently free.

### Deploy the client to Vercel

The repository includes a Vercel configuration for the static Vite client. Import the GitHub repository into Vercel and keep the project root set to the repository root. Vercel uses `npm run build` and publishes `client/dist`; the rewrite serves the React application for client-side routes.

The build uses Vercel's production domain for the sitemap and `robots.txt` automatically. If you have a custom domain, set `VITE_SITE_URL` to that production origin in the Vercel project's Production environment variables. Add `VITE_GA_ID` or `VITE_CURRENCY_API_URL` only if you intend to enable those client-side integrations; all `VITE_` values are public.

This deploys the frontend only. The optional Express health API is not required by the current client and must be deployed separately if you later add client features that call it.

For a deployment:

1. Build the client with `npm run build` and set the hosting output directory to `client/dist`.
2. Configure the client host's SPA rewrite to serve `index.html` for client-side routes.
3. Deploy `server/` as a Node.js service with `npm start`; set `PORT` and `CLIENT_ORIGIN`.
4. Add only required environment variables through the hosting provider's environment settings.
5. Configure a domain and HTTPS at the host, then set the production origin consistently for CORS.

## Domain, SEO and Search Console

Set `VITE_SITE_URL` to the production canonical origin before building; the build generates `robots.txt` and a sitemap containing all tool and information routes. Confirm that both are public and correct, then verify the domain in Google Search Console and submit `/sitemap.xml`. Search visibility and ranking are not guaranteed.

The app sets route-specific titles, descriptions, canonical links, Open Graph and Twitter tags, and relevant structured data at runtime. For reliable indexing on platforms that require HTML rendered per URL, consider adding server-side rendering or prerendering as a later deployment enhancement.

## Analytics and advertising

Google Analytics is not loaded unless `VITE_GA_ID` is configured before the client build. Follow applicable consent and privacy requirements for your audience. Advertisement locations are labeled development placeholders only; integrate an advertising provider only after its policies, privacy obligations and site readiness have been reviewed. No publisher ID is hardcoded and no ad interaction is encouraged.

## PWA

The client includes a web app manifest and a lightweight service worker that caches static assets after they are requested. Confirm HTTPS and your host's SPA fallback behavior before enabling a production install prompt.
