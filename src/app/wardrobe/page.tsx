import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  GARMENT_CATEGORY_LABELS,
  signGarmentPhotoUrl,
  type Garment,
} from "@/lib/garments";
import { createClient } from "@/lib/supabase/server";

export default async function WardrobePage() {
  const supabase = await createClient();

  const { data: garments, error } = await supabase
    .from("garments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-destructive">
          Couldn&apos;t load your wardrobe: {error.message}
        </p>
      </main>
    );
  }

  const items = (garments ?? []) as Garment[];

  // Sign every photo URL in parallel. We do this server-side so the markup
  // can render with finished <img src> values and Next/Image can lay them out.
  const signedUrls = await Promise.all(
    items.map((g) => signGarmentPhotoUrl(supabase, g.photo_path)),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
            Your wardrobe
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            {items.length === 0
              ? "Nothing here yet. Add your first garment to get started."
              : `${items.length} ${items.length === 1 ? "garment" : "garments"}`}
          </p>
        </div>
        <Link href="/wardrobe/new" className={buttonVariants({ size: "lg" })}>
          Add garment
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-foreground/20 text-center">
          <p className="font-serif italic text-foreground/60">
            An empty closet, full of possibility.
          </p>
          <Link
            href="/wardrobe/new"
            className={`${buttonVariants({ variant: "outline" })} mt-4`}
          >
            Add your first garment
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g, i) => (
            <li key={g.id}>
              <Link
                href={`/wardrobe/${g.id}`}
                className="group block overflow-hidden rounded-md border border-foreground/10 bg-foreground/5"
              >
                <div className="relative aspect-square w-full bg-foreground/5">
                  {signedUrls[i] ? (
                    <Image
                      src={signedUrls[i]!}
                      alt={g.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-foreground/40">
                      no photo
                    </div>
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="truncate font-serif text-base text-foreground">
                    {g.name}
                  </p>
                  <p className="truncate text-xs text-foreground/60">
                    {GARMENT_CATEGORY_LABELS[g.category]} · {g.color}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
