import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Profile } from "~/utils/database/profiles";

import authenticated from "~/policies/authenticated.server";
import { getProfile } from "~/utils/database/profiles";
import { SessionUser } from "~/types";

type LoaderData = {
  user: SessionUser;
  profile: Profile | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  await authenticated({ request });

  return null;
};

export default function Profile() {
  return <h1>This is an example of a page that requires authentication</h1>;
}
