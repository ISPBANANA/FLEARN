import { Google } from 'arctic';

export const google = new Google(
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!
);