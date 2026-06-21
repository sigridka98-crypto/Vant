"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";

type BookmarkToggleProps = {
  cardId: string;
  slug: string;
  isBookmarked: boolean;
  compact?: boolean;
  className?: string;
};

export function BookmarkToggle({
  cardId,
  slug,
  isBookmarked,
  compact = false,
  className
}: BookmarkToggleProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const nextState = !bookmarked;
    setBookmarked(nextState);

    startTransition(async () => {
      try {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cardId,
            slug,
            bookmarked: nextState
          })
        });

        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; message?: string }
          | null;

        if (response.status === 401) {
          setBookmarked(!nextState);
          router.push("/login?message=Sign in to save update cards.");
          return;
        }

        if (!response.ok || !payload?.ok) {
          setBookmarked(!nextState);
          return;
        }

        router.refresh();
      } catch {
        setBookmarked(!nextState);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={bookmarked}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm text-text-secondary transition hover:border-primary/30 hover:text-text-main disabled:cursor-wait disabled:opacity-70",
        compact ? "px-3 py-2" : "px-4 py-2.5",
        bookmarked && "border-primary/30 bg-primary/12 text-primary",
        className
      )}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {compact ? null : bookmarked ? "Saved" : "Save"}
    </button>
  );
}
