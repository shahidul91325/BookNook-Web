# BookNook

BookNook is a community library application for sharing, borrowing, and managing books. Built with Next.js 16, TypeScript, Tailwind CSS, Better Auth, and MongoDB.

## Environment Variables

Create a `.env.local` (development) or set these in your production host (e.g. Vercel project settings):

```env
# Express REST API (protected requests use a Better Auth JWT)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Auth requests stay same-origin so the remote Express server's httpOnly
# session cookie is available to the Next.js proxy. next.config.ts rewrites
# /api/auth/* to this server-side destination.
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/auth
AUTH_SERVER_URL=http://localhost:5000/api/auth

# The Better Auth secret, Google OAuth credentials, and MongoDB URI/database
# belong in BookNook-Server/.env. Do not put server secrets in this frontend.

# Image Storage (Required for book cover uploads)
# Images are uploaded to ImgBB. The key is read server-side only and is never
# exposed to the browser. Get a free key at https://api.imgbb.com/
IMGBB_API_KEY=your_imgbb_api_key_here
```

### Required: `IMGBB_API_KEY`

Book cover images are uploaded through the `/api/upload` route, which sends them directly to [ImgBB](https://api.imgbb.com/). The permanent hosted URL returned by ImgBB is stored on the book document in MongoDB.

Set `IMGBB_API_KEY` in:

- **Local development:** `.env.local` (git-ignored, never committed)
- **Vercel production:** Project Settings → Environment Variables → add `IMGBB_API_KEY`

Without this variable, image uploads return a 500 error instead of falling back to local disk storage (Vercel's filesystem is read-only).

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
`/api/auth/*` on the frontend origin; the Next.js rewrite forwards those
requests to `AUTH_SERVER_URL`, keeping the server-issued session cookie on the
frontend host for refreshes, navigation, and the optimistic route proxy. Set
`AUTH_SERVER_URL` to the Express Better Auth mount and `NEXT_PUBLIC_API_URL` to
the Express API origin for production.

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
