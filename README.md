# BookNook

BookNook is a community library application for sharing, borrowing, and managing books. Built with Next.js 16, TypeScript, Tailwind CSS, Better Auth, and MongoDB.

## Environment Variables

Create a `.env.local` (development) or set these in your production host (e.g. Vercel project settings):

```env
# Express API origin used for REST calls and the same-origin /api/auth rewrite.
NEXT_PUBLIC_API_URL=http://localhost:5000

# The Better Auth secret, Google OAuth credentials, and MongoDB URI/database
# belong in BookNook-Server/.env. Do not put server secrets in this frontend.

# Optional image storage (required only when uploading book covers)
# Images are uploaded to ImgBB. The key is read server-side only and is never
# exposed to the browser. Get a free key at https://api.imgbb.com/
IMGBB_API_KEY=your_imgbb_api_key_here
```

### Optional: `IMGBB_API_KEY`

Book cover images are uploaded through the `/api/upload` route, which sends them directly to [ImgBB](https://api.imgbb.com/). The permanent hosted URL returned by ImgBB is stored on the book document in MongoDB.

Set `IMGBB_API_KEY` in:

- **Local development:** `.env.local` (git-ignored, never committed)
- **Vercel production:** Project Settings → Environment Variables → add `IMGBB_API_KEY`

Without this variable, the image upload endpoint returns a configuration error. Vercel's filesystem is read-only, so uploads are not saved locally.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Auth and API routing

The Express server is the only Better Auth server. The browser uses
the standard `/api/auth/*` path. Better Auth's client uses its default auth
base path, and one Next.js rewrite forwards that path to the Express origin in
`NEXT_PUBLIC_API_URL`. The session cookie stays on the frontend host for
refreshes, navigation, and the route proxy. REST calls use the same configured
Express origin directly.

After sign-in, the frontend obtains a JWT through Better Auth's JWT plugin
endpoint and sends it as `Authorization: Bearer <token>` to protected REST
routes. Express verifies the JWT and derives the user identity from verified
claims. The browser never supplies an owner ID as authority.

## Image Upload Flow

1. User selects a book cover image in the Add Book or Edit Book form.
2. The client posts the file to `/api/upload` (multipart/form-data).
3. The route handler validates type/size server-side, then uploads the image to ImgBB using the server-side `IMGBB_API_KEY`.
4. ImgBB returns a permanent hosted image URL, which the API returns in the existing response shape (`{ success: true, url, provider: "imgbb", ... }`).
5. The frontend saves that URL in the `image` field of the MongoDB book document when creating or updating a book.

The API key never reaches the browser; all ImgBB communication happens in the Next.js route handler.

## Vercel configuration

The frontend and backend are separate Vercel projects. Set each project root to
its repository root. Vercel recognizes the backend's root `server.ts` default
Express export; no backend `vercel.json` or custom backend rewrite is required.

### Frontend project variables

Set these for Production and Preview, with values matching that environment:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express API origin, such as `https://<backend-domain>` |
| `IMGBB_API_KEY` | Optional server-only key, needed only for cover uploads |

`NEXT_PUBLIC_API_URL` is embedded during `next build`, so configure it before
deploying. Keep the Better Auth secret, Google OAuth credentials, and MongoDB
URI out of the frontend project.

### Backend project variables

Required in Production and Preview: `MONGODB_URI`, `MONGODB_DB_NAME`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `JWT_JWKS_URL`. Populate secrets
directly in Vercel, never in committed files.

- `BETTER_AUTH_URL` is the matching frontend origin plus `/api/auth`.
- CORS and Better Auth trusted origins are derived from `BETTER_AUTH_URL`.
- `JWT_JWKS_URL` is the direct Express URL ending in `/api/auth/jwks`.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required only for Google login.
- JWT issuer and audience both use `BETTER_AUTH_URL`.
- `PORT` is for local development; Vercel supplies its own listener.

Use a stable frontend Preview domain and configure the backend Preview
`BETTER_AUTH_URL` to match it. Register that domain's
`/api/auth/callback/google` URL with Google. A changing generated preview host
requires corresponding backend Preview and Google OAuth settings. Production
must use the production frontend domain.

For local development, run Next.js on port 3000 and Express on port 5000. The
example files contain the local URLs; the backend README lists its full
environment configuration.
