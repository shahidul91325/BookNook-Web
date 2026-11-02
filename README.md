# BookNook

BookNook is a community library application for sharing, borrowing, and managing books. Built with Next.js 16, TypeScript, Tailwind CSS, Better Auth, and MongoDB.

## Environment Variables

Create a `.env.local` (development) or set these in your production host (e.g. Vercel project settings):

```env
# Express Backend REST API base URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Next.js Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth Secret (generate a secure 32+ character random secret)
BETTER_AUTH_SECRET=your_32_character_random_secret_here

# Better Auth Base URL
BETTER_AUTH_URL=http://localhost:3000

# MongoDB Database Connection
MONGODB_URI=mongodb://localhost:27017/booknook
MONGODB_DB_NAME=booknook

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

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

## Image Upload Flow

1. User selects a book cover image in the Add Book or Edit Book form.
2. The client posts the file to `/api/upload` (multipart/form-data).
3. The route handler validates type/size server-side, then uploads the image to ImgBB using the server-side `IMGBB_API_KEY`.
4. ImgBB returns a permanent hosted image URL, which the API returns in the existing response shape (`{ success: true, url, provider: "imgbb", ... }`).
5. The frontend saves that URL in the `image` field of the MongoDB book document when creating or updating a book.

The API key never reaches the browser; all ImgBB communication happens in the Next.js route handler.
