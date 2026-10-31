export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession {
  user: AuthUser | null;
  token?: string | null;
}
