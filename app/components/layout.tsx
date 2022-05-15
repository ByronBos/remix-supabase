import { Form, Link } from "@remix-run/react";
import { ReactNode } from "react";
import { SessionUser } from "~/types";

const Layout: React.FC<{
  children: ReactNode;
  user: SessionUser | null;
  hideControls?: boolean;
}> = ({ children, user, hideControls = false }) => {
  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center">
        <Link to="/">
          <h1 className="text-2xl font-light">
            Remix / Supabase <strong className="font-bold">Template</strong>
          </h1>
        </Link>
        {!hideControls && (
          <div>
            {!!user && (
              <div>
                <h1 className="inline mr-4">
                  Hi <strong>{user.firstName}</strong>
                </h1>
                <Form action="/sign-out" method="post" className="inline">
                  <button
                    type="submit"
                    className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-3"
                    aria-live="polite"
                  >
                    Sign out
                  </button>
                </Form>
              </div>
            )}
            {!user && (
              <div>
                <Link
                  to="/join"
                  className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-3"
                >
                  Get Started
                </Link>
                <Link
                  to="/sign-in"
                  className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-3"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
      <main className="w-full md:w-3/4 lg:w-2/4 mx-auto py-6 my-6">
        {children}
      </main>
    </div>
  );
};
export default Layout;
