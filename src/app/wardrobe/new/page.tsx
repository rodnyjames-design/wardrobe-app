import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GARMENT_CATEGORIES,
  GARMENT_CATEGORY_LABELS,
} from "@/lib/garments";

import { addGarment } from "./actions";

export default async function NewGarmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/wardrobe"
          className="text-sm text-foreground/60 underline-offset-4 hover:underline"
        >
          ← Back to wardrobe
        </Link>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
        Add a garment
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        One photo, a name, and a category — the rest is optional.
      </p>

      <form action={addGarment} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="photo">Photo</Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-foreground/10 file:px-3 file:py-1 file:text-foreground"
          />
          <p className="text-xs text-foreground/50">
            JPG, PNG, WebP, or HEIC — up to 5 MB.
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
            placeholder="Linen shirt"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="" disabled>
                Choose…
              </option>
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
              placeholder="Cream"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">
            Brand <span className="text-foreground/40">(optional)</span>
          </Label>
          <Input id="brand" name="brand" type="text" maxLength={80} />
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
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            placeholder="Fit, care instructions, where you wore it last…"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error === "name"
              ? "Name is required."
              : error === "category"
                ? "Pick a category."
                : error === "color"
                  ? "Color is required."
                  : error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit">Save garment</Button>
          <Button type="reset" variant="ghost">
            Clear
          </Button>
        </div>
      </form>
    </main>
  );
}
