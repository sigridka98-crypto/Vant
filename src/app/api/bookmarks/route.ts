import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { toggleLocalBookmark } from "@/lib/local-user-state";
import { setBookmarkForUser } from "@/lib/supabase/live-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookmarkRequest = {
  cardId?: string;
  slug?: string;
  bookmarked?: boolean;
};

export async function POST(request: Request) {
  const { cardId, slug, bookmarked } = (await request.json()) as BookmarkRequest;

  if (!cardId || typeof bookmarked !== "boolean") {
    return NextResponse.json({ ok: false, message: "Missing bookmark details." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    await toggleLocalBookmark(cardId, bookmarked);
    revalidatePath("/dashboard");
    revalidatePath("/bookmarks");
    if (slug) {
      revalidatePath(`/cards/${slug}`);
    }
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "Sign in to save cards." }, { status: 401 });
  }

  const result = await setBookmarkForUser(user.id, { cardId, bookmarked });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 500 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/bookmarks");
  if (slug) {
    revalidatePath(`/cards/${slug}`);
  }

  return NextResponse.json({ ok: true, message: result.message });
}
