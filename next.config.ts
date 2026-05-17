import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photos can be several megabytes — bump from the 1 MB default so
      // uploads via Server Actions don't get truncated by the runtime.
      // Matches our storage bucket's 5 MB ceiling.
      bodySizeLimit: "5mb",
    },
  },
  images: {
    // Signed URLs from Supabase Storage live under the project's domain.
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/sign/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
