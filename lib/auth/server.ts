import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer, jwt } from "better-auth/plugins";
import { getMongoClient } from "@/lib/db/mongodb";

const dbName = process.env.MONGODB_DB_NAME || "booknook";
const mongoClient = getMongoClient();
const db = mongoClient.db(dbName);

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "booknook-session-secret-key-32-chars-long!!",
  database: mongodbAdapter(db),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
  },
  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),
  plugins: [bearer(), jwt()],
});

export type Auth = typeof auth;
