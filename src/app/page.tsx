import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-end gap-3 px-6 py-4 text-sm text-foreground/70">
        {user ? (
          <>
            <span>{user.email}</span>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="underline-offset-4 hover:underline"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        )}
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground">
            Wardrobe
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-foreground/70">
            {user
              ? "Welcome back."
              : "A quiet place for the things you wear."}
          </p>
          {user ? (
            <Link
              href="/wardrobe"
              className={`${buttonVariants({ size: "lg" })} mt-2`}
            >
              Open your wardrobe →
            </Link>
          ) : (
            <Link
              href="/login"
              className={`${buttonVariants({ size: "lg" })} mt-2`}
            >
              Sign in
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
