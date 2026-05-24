import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { markLocalAlertSeen } from "@/lib/local-user-state";
import { markAlertSeenForUser } from "@/lib/supabase/live-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { cardId } = (await request.json()) as { cardId?: string };

  if (!cardId) {
    return NextResponse.json({ ok: false, message: "Missing card id." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    await markLocalAlertSeen(cardId);
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const result = await markAlertSeenForUser(user.id, { cardId });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
