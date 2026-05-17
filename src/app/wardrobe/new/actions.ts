"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  extensionForMimeType,
  GARMENT_CATEGORIES,
  GARMENT_PHOTO_BUCKET,
  type GarmentCategory,
} from "@/lib/garments";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function getNullableString(formData: FormData, key: string): string | null {
  const v = getString(formData, key);
  return v.length > 0 ? v : null;
}

export async function addGarment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const name = getString(formData, "name");
  const category = getString(formData, "category") as GarmentCategory;
  const color = getString(formData, "color");
  const brand = getNullableString(formData, "brand");
  const notes = getNullableString(formData, "notes");
  const photo = formData.get("photo");

  // Cheap validation — DB has matching checks but failing here keeps the
  // round-trip short for obvious mistakes.
  if (!name || name.length > 120) {
    redirect("/wardrobe/new?error=name");
  }
  if (!GARMENT_CATEGORIES.includes(category)) {
    redirect("/wardrobe/new?error=category");
  }
  if (!color || color.length > 60) {
    redirect("/wardrobe/new?error=color");
  }

  // Mint the garment id up front so we can build the storage path before insert.
  const id = crypto.randomUUID();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    // Vercel serverless functions cap the request body around 4.5 MB. Reject
    // earlier with a friendly error rather than silently failing the upload.
    const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
    if (photo.size > MAX_PHOTO_BYTES) {
      redirect(
        `/wardrobe/new?error=${encodeURIComponent(
          `Photo is too large (${(photo.size / 1024 / 1024).toFixed(1)} MB). Max is 4 MB — try a smaller photo or lower your iPhone Camera quality.`,
        )}`,
      );
    }

    const ext = extensionForMimeType(photo.type);
    photoPath = `${user.id}/${id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(GARMENT_PHOTO_BUCKET)
      .upload(photoPath, photo, {
        contentType: photo.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      redirect(
        `/wardrobe/new?error=${encodeURIComponent(
          "Photo upload failed: " + uploadError.message,
        )}`,
      );
    }
  }

  const { error: insertError } = await supabase.from("garments").insert({
    id,
    user_id: user.id,
    name,
    category,
    color,
    brand,
    notes,
    photo_path: photoPath,
  });

  if (insertError) {
    // Roll back the photo upload so we don't leave orphan files in storage.
    if (photoPath) {
      await supabase.storage.from(GARMENT_PHOTO_BUCKET).remove([photoPath]);
    }
    redirect(
      `/wardrobe/new?error=${encodeURIComponent(insertError.message)}`,
    );
  }

  revalidatePath("/wardrobe");
  redirect(`/wardrobe/${id}`);
}
