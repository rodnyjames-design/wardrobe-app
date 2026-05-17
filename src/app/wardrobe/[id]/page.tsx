import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GARMENT_CATEGORIES,
  GARMENT_CATEGORY_LABELS,
  signGarmentPhotoUrl,
  type Garment,
} from "@/lib/garments";
import { createClient } from "@/lib/supabase/server";

import { deleteGarment, updateGarment } from "./actions";

export default async function GarmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error: errorMsg, saved } = await searchParams;

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("garments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="text-sm text-destructive">
          Couldn&apos;t load this garment: {fetchError.message}
        </p>
      </main>
    );
  }

  if (!data) notFound();

  const garment = data as Garment;
  const signedUrl = await signGarmentPhotoUrl(supabase, garment.photo_path);

  // Bind action arguments so the form can call the action with just FormData.
  const update = updateGarment.bind(null, garment.id);
  const remove = deleteGarment.bind(null, garment.id, garment.photo_path);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/wardrobe"
          className="text-sm text-foreground/60 underline-offset-4 hover:underline"
        >
          ← Back to wardrobe
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-foreground/10 bg-foreground/5">
          {signedUrl ? (
            <Image
              src={signedUrl}
              alt={garment.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-foreground/40">
              no photo
            </div>
          )}
        </div>

        <form action={update} className="space-y-5">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
              {garment.name}
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              {GARMENT_CATEGORY_LABELS[garment.category]} · {garment.color}
              {garment.brand ? ` · ${garment.brand}` : ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              maxLength={120}
              defaultValue={garment.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                defaultValue={garment.category}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                {GARMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {GARMENT_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                type="text"
                required
                maxLength={60}
                defaultValue={garment.color}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">
              Brand <span className="text-foreground/40">(optional)</span>
            </Label>
            <Input
              id="brand"
              name="brand"
              type="text"
              maxLength={80}
              defaultValue={garment.brand ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-foreground/40">(optional)</span>
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={2000}
              defaultValue={garment.notes ?? ""}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          {errorMsg ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMsg === "name"
                ? "Name is required."
                : errorMsg === "category"
                  ? "Pick a category."
                  : errorMsg === "color"
                    ? "Color is required."
                    : errorMsg}
            </p>
          ) : null}

          {saved ? (
            <p className="text-sm text-foreground/70" role="status">
              Saved.
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
          </div>
        </form>
      </div>

      <form action={remove} className="mt-10 border-t border-foreground/10 pt-6">
        <p className="mb-3 text-sm text-foreground/60">
          Delete this garment permanently. Its photo will also be removed from
          storage.
        </p>
        <SubmitButton variant="destructive" pendingText="Deleting…">
          Delete garment
        </SubmitButton>
      </form>
    </main>
  );
}
