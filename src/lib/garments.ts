// Shared types, constants, and helpers for the garments domain.
// Anything touching Supabase Storage signed URLs is here too so we have
// one place to revisit when we change buckets / signing TTLs.

import type { SupabaseClient } from "@supabase/supabase-js";

export const GARMENT_CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "footwear",
  "accessories",
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];

export const GARMENT_CATEGORY_LABELS: Record<GarmentCategory, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  dresses: "Dresses",
  outerwear: "Outerwear",
  footwear: "Footwear",
  accessories: "Accessories",
};

export type Garment = {
  id: string;
  user_id: string;
  name: string;
  category: GarmentCategory;
  color: string;
  brand: string | null;
  notes: string | null;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

export const GARMENT_PHOTO_BUCKET = "garment-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Generate a signed URL for a garment photo so it can be rendered in <Image>
 * tags. Returns null if the path is null/empty or signing fails.
 */
export async function signGarmentPhotoUrl(
  supabase: SupabaseClient,
  photoPath: string | null,
): Promise<string | null> {
  if (!photoPath) return null;
  const { data, error } = await supabase.storage
    .from(GARMENT_PHOTO_BUCKET)
    .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Pick the file extension for an uploaded photo based on its MIME type.
 * Falls back to jpg if the MIME is unknown.
 */
export function extensionForMimeType(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
}
