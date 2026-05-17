"use client";

import { useFormStatus } from "react-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A native <button type="submit"> wired to useFormStatus so users see a pending
 * state while the server action runs. Styled with the same buttonVariants as
 * the shadcn Button so it visually matches the rest of the app.
 *
 * We use a native button rather than the shadcn Button to avoid any
 * primitive-library quirks around form submission on mobile Safari.
 */
export function SubmitButton({
  children,
  pendingText,
  className,
  variant = "default",
  size = "lg",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
