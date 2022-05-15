import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import authenticated from "~/policies/authenticated.server";

export const loader: LoaderFunction = async ({ request }) => {
  let user = null;

  try {
    user = await authenticated({ request });
  } catch (error) {}
  return json({ user });
};

const Index = () => {
  const { user } = useLoaderData();

  return (
    <section>
      <h2 className="text-3xl font-light">Welcome</h2>
      <p>
        This is a template site demonstrating a way to work with Remix and
        Supabase. It includes a basic structure for authentication and
        authorization.
      </p>
      <section className="my-6 w-full max-w-sm lg:max-w-full">
        <p>Unauthenticated</p>
        <ul>
          <li>
            <Link to="/" className="text-blue-300">
              Home
            </Link>
          </li>
        </ul>
      </section>

      <section className="my-6 w-full max-w-sm lg:max-w-full">
        <ul>
          <p>Authenticated</p>
          <li>
            <Link to="/profile" className="text-blue-300">
              Profile
            </Link>
          </li>
          <li>
            <Link to="/example" className="text-blue-300">
              Example
            </Link>
          </li>
        </ul>
      </section>

      <section className="my-6 w-full max-w-sm lg:max-w-full">
        <p>Misc</p>
        <ul>
          <li>
            <Link to="/sign-in" className="text-blue-300">
              Sign In
            </Link>
          </li>
          <li>
            <Link to="/join" className="text-blue-300">
              Join
            </Link>
          </li>
          <li>
            <Link to="/complete-profile" className="text-blue-300">
              Complete Profile
            </Link>
          </li>
        </ul>
      </section>
    </section>
  );
};
export default Index;
