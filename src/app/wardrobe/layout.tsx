import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Auth gate for every /wardrobe/* route. We check the session here once
// rather than in each page so individual pages can assume `user` exists.
export default async function WardrobeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
