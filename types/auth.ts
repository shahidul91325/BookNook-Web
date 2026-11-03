export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  /** Backend-issued role from the Better Auth session (e.g. "admin"). Never
   *  trusted for authorization: the backend enforces access from the JWT. */
  role?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession {
  user: AuthUser | null;
  token?: string | null;
}
