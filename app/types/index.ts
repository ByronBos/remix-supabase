export type TypedWindow = Window &
  typeof globalThis & {
    ENV: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  };

export type Error = { error?: string };

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};
