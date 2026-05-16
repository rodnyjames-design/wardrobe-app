"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
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

export async function updateGarment(id: string, formData: FormData) {
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

  if (!name || name.length > 120) {
    redirect(`/wardrobe/${id}?error=name`);
  }
  if (!GARMENT_CATEGORIES.includes(category)) {
    redirect(`/wardrobe/${id}?error=category`);
  }
  if (!color || color.length > 60) {
    redirect(`/wardrobe/${id}?error=color`);
  }

  const { error } = await supabase
    .from("garments")
    .update({ name, category, color, brand, notes })
    .eq("id", id);

  if (error) {
    redirect(
      `/wardrobe/${id}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/wardrobe");
  revalidatePath(`/wardrobe/${id}`);
  redirect(`/wardrobe/${id}?saved=1`);
}

export async function deleteGarment(id: string, photoPath: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Best effort: remove photo first, then the row. If photo removal fails
  // (e.g. it was already gone), still attempt the row delete.
  if (photoPath) {
    await supabase.storage.from(GARMENT_PHOTO_BUCKET).remove([photoPath]);
  }

  const { error } = await supabase.from("garments").delete().eq("id", id);
  if (error) {
    redirect(
      `/wardrobe/${id}?error=${encodeURIComponent(
        "Couldn't delete: " + error.message,
      )}`,
    );
  }

  revalidatePath("/wardrobe");
  redirect("/wardrobe");
}
