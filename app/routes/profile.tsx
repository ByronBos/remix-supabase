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
  const user = await authenticated({ request });
  const profile = await getProfile();

  return json({ user, profile });
};

export default function Profile() {
  const { user, profile } = useLoaderData<LoaderData>();

  return (
    <section>
      <h2 className="text-3xl font-light">
        Hi <strong className="font-bold">{profile?.first_name}</strong>,
      </h2>
      <section className="max-w-sm w-full lg:max-w-full my-6">
        <div className="mb-2">
          <p className="text-gray-400 text-sm font-bold">Full name</p>
          <p>{`${profile?.first_name} ${profile?.last_name}`}</p>
        </div>
        <div className="mb-2">
          <p className="text-gray-400 text-sm font-bold">Email</p>
          <p>{user.email}</p>
        </div>
      </section>
      <div style={{ textAlign: "center" }}>
        <pre style={{ textAlign: "left" }}>
          <code>{JSON.stringify(user, null, 2)}</code>
        </pre>
      </div>
    </section>
  );
}
