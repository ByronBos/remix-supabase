import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useTransition,
} from "@remix-run/react";
import Layout from "./components/layout";
import authenticated from "./policies/authenticated.server";
import styles from "./tailwind.css";
import { SessionUser } from "./types";
import { ROUTES } from "./utils/routing/routes";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix / Supabase / Vercel - Template",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: SessionUser | null;
  ENV: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  let sessionUser = await authenticated({
    request,
    allowUnauthenticated: true,
  });

  return json<LoaderData>({
    user: sessionUser,
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    },
  });
};

export default function App() {
  const { user, ENV } = useLoaderData();
  const { state, location, submission, type } = useTransition();
  const { pathname } = useLocation();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-slate-800 text-gray-300">
        <Layout user={user} hideControls={pathname === ROUTES.completeProfile}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
