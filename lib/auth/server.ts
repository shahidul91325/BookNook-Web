import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer, jwt } from "better-auth/plugins";
import { createHmac } from "node:crypto";
import { getMongoClient } from "@/lib/db/mongodb";

const dbName = process.env.MONGODB_DB_NAME || "booknook";
const mongoClient = getMongoClient();
const db = mongoClient.db(dbName);

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const betterAuthSecret =
  process.env.BETTER_AUTH_SECRET ||
  "booknook-session-secret-key-32-chars-long!!";

// Shared JWT signing secret matching the backend JWT_SECRET
const jwtSecret =
  process.env.JWT_SECRET ||
  betterAuthSecret;

const jwtIssuer = process.env.JWT_ISSUER || "booknook-api";
const jwtAudience = process.env.JWT_AUDIENCE || "booknook-client";

/**
 * Base64url encode helper without padding.
 */
function base64urlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const auth = betterAuth({
  baseURL,
  secret: betterAuthSecret,
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
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
  plugins: [
    bearer(),
    jwt({
      jwks: {
        remoteUrl: `${baseURL}/api/auth/jwks`,
        keyPairConfig: { alg: "EdDSA" },
      },
      jwt: {
        issuer: jwtIssuer,
        audience: jwtAudience,
        expirationTime: "1h",
        definePayload: ({ user }) => {
          const userWithRole = user as typeof user & { role?: string | null };
          return {
            role: userWithRole.role || "user",
          };
        },
        sign: async (payload) => {
          const header = { alg: "HS256", typ: "JWT" };
          const headerB64 = base64urlEncode(
            Buffer.from(JSON.stringify(header), "utf8")
          );
          const payloadB64 = base64urlEncode(
            Buffer.from(JSON.stringify(payload), "utf8")
          );
          const signingInput = `${headerB64}.${payloadB64}`;

          const signature = createHmac("sha256", jwtSecret)
            .update(signingInput, "utf8")
            .digest("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          return `${signingInput}.${signature}`;
        },
      },
    }),
  ],
});

export type Auth = typeof auth;

