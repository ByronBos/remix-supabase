# Remix / Supabase Template Project

This is a template project that can be easily cloned to kickstart a wide range of projects.
Key technologies are:

- [Remix](https://remix.run/) - Web Framework
- [Supabase](https://supabase.com/) - Open Source backend service, offering a full Postgres DB, authentication, functions, storage, and more.
- [Tailwind CSS](https://tailwindcss.com/) - A somewhat controversial css framework, for those that miss the days of inlining everything.
- [TypeScript](https://www.typescriptlang.org/) - In my view essential for any sizeable project, particularly if you're working with others.
- [Vercel](https://vercel.com/) - Hosting platform, and one of the easiest to work with!

## Getting Started

For local development you'll need to set up supabase, which essentially runs their full stack in a docker container locally. (https://supabase.com/docs/guides/local-development)
Once that's up and running you can point this dev environment by setting up the relevant environment variables. Create a .env file and they'll get picked up.
The keys you'll need are:

SUPABASE_URL  
SUPABASE_ANON_KEY  
RAND_SECRET

RAND_SECRET can be any random string you'd like. Keep it secret, keep it safe.

In addition, if you want to use google sign in and others you'll need to set the client id and secret at the bottom of /supabase/config.toml
Careful not to commit these to a public repo!
In production this gets set in the supabase admin

This template includes support for Google SSO, others will need some research and changes.

Once you have supabase running locally and the environment variables set up then you're good to go!

## Development

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
npm install
```

Afterwards, start the Remix development server like so:

```sh
npm run dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

npm run dev will also generate and watch for css changes (this template uses tailwindcss)
