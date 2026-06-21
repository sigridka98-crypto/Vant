"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { readLocalDb, writeLocalDb } from "@/lib/local-dev-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import type { ScamSeverity } from "@/types";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function checkedValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function severityValue(formData: FormData): ScamSeverity {
  const value = textValue(formData, "severity");
  if (value === "trending" || value === "high_risk") {
    return value;
  }

  return "common";
}

function updateTypeValue(formData: FormData) {
  return textValue(formData, "updateType") === "major" ? "major" : "minor";
}

function linesToSteps(value: string, stepType: "how_it_works" | "red_flags" | "protection") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((content, index) => ({
      step_type: stepType,
      content,
      sort_order: index + 1
    }));
}

function hasAlertFlags(input: {
  is_new_alert: boolean;
  is_trending_alert: boolean;
  is_most_reported: boolean;
}) {
  return input.is_new_alert || input.is_trending_alert || input.is_most_reported;
}

function validateSafeExample(value: string) {
  const rules = [
    { pattern: /(https?:\/\/|www\.)/i, message: "Safe example must not include links or websites." },
    { pattern: /\b\d{6,}\b/, message: "Safe example must not include long number strings or account-like numbers." },
    { pattern: /(account number|wallet address|routing number|sort code)/i, message: "Safe example must stay sanitized and avoid real payment details." }
  ];

  return rules.find((rule) => rule.pattern.test(value))?.message ?? null;
}

function validateCardForPublish(input: {
  title: string;
  category: string;
  description: string;
  safe_example: string;
  quick_memory_rule: string;
  alert_summary: string;
  is_new_alert: boolean;
  is_trending_alert: boolean;
  is_most_reported: boolean;
  steps: Array<{ step_type: "how_it_works" | "red_flags" | "protection"; content: string }>;
}) {
  const errors: string[] = [];

  if (!input.title.trim()) errors.push("Title is required before publishing.");
  if (!input.category.trim()) errors.push("Category is required before publishing.");
  if (!input.description.trim()) errors.push("Description is required before publishing.");
  if (!input.safe_example.trim()) errors.push("Safe example is required before publishing.");
  if (!input.quick_memory_rule.trim()) errors.push("Quick memory rule is required before publishing.");

  const howItWorksCount = input.steps.filter((step) => step.step_type === "how_it_works").length;
  const redFlagsCount = input.steps.filter((step) => step.step_type === "red_flags").length;
  const protectionCount = input.steps.filter((step) => step.step_type === "protection").length;

  if (!howItWorksCount) errors.push("Add at least one 'How the update works' step before publishing.");
  if (!redFlagsCount) errors.push("Add at least one red flag before publishing.");
  if (!protectionCount) errors.push("Add at least one protection step before publishing.");

  const safeExampleError = validateSafeExample(input.safe_example);
  if (safeExampleError) errors.push(safeExampleError);

  if (hasAlertFlags(input) && !input.alert_summary.trim()) {
    errors.push("Add an alert summary when marking a card as New Update Alert, Trending Update, or Most Reported.");
  }

  return errors;
}

async function ensureUniqueSlug(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, rawSlug: string, currentId?: string) {
  const baseSlug = slugify(rawSlug);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = supabase.from("scam_cards").select("id").eq("slug", slug).maybeSingle();
    const { data } = await query;

    if (!data || data.id === currentId) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function createCard(formData: FormData) {
  const auth = await requireAdmin();
  const title = textValue(formData, "title") || "Untitled template";
  const slugInput = textValue(formData, "slug") || title;

  const payload = {
    title,
    category: textValue(formData, "category") || "Uncategorized",
    description: textValue(formData, "description"),
    safe_example: textValue(formData, "safeExample"),
    quick_memory_rule: textValue(formData, "quickMemoryRule"),
    alert_summary: textValue(formData, "alertSummary"),
    severity: severityValue(formData),
    is_free: checkedValue(formData, "isFree"),
    credit_cost: Math.max(0, numberValue(formData, "creditCost", 0)),
    is_published: checkedValue(formData, "isPublished"),
    is_new_alert: checkedValue(formData, "isNewAlert"),
    is_trending_alert: checkedValue(formData, "isTrendingAlert"),
    is_most_reported: checkedValue(formData, "isMostReported"),
    current_version: Math.max(1, numberValue(formData, "currentVersion", 1)),
    major_update_reunlock_cost: textValue(formData, "majorUpdateReunlockCost")
      ? Math.max(0, numberValue(formData, "majorUpdateReunlockCost", 0))
      : null,
    created_by: auth.user?.id ?? null
  };

  if (payload.is_free) {
    payload.credit_cost = 0;
  }

  const steps = [
    ...linesToSteps(textValue(formData, "howItWorks"), "how_it_works"),
    ...linesToSteps(textValue(formData, "redFlags"), "red_flags"),
    ...linesToSteps(textValue(formData, "protection"), "protection")
  ];

  if (payload.is_published) {
    const errors = validateCardForPublish({
      ...payload,
      steps
    });

    if (errors.length) {
      redirect(`/admin?error=${encodeURIComponent(errors[0])}`);
    }
  }

  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const id = crypto.randomUUID();
    const slug = await ensureUniqueLocalSlug(db.cards.map((card) => ({ id: card.id, slug: card.slug })), slugInput);
    const now = new Date().toISOString();

    db.cards.unshift({
      id,
      slug,
      ...payload,
      created_at: now,
      updated_at: now,
      created_by: auth.user?.id ?? null,
      steps: steps.map((step) => ({
        id: crypto.randomUUID(),
        card_id: id,
        ...step
      }))
    });

    await writeLocalDb(db);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    redirect(`/admin/cards/${id}/edit?message=${encodeURIComponent("Template created successfully.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const slug = await ensureUniqueSlug(supabase, slugInput);
  const { data, error } = await supabase
    .from("scam_cards")
    .insert({ ...payload, slug })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin?error=${encodeURIComponent(error?.message ?? "Unable to create template.")}`);
  }

  if (steps.length) {
    await supabase.from("scam_card_steps").insert(
      steps.map((step) => ({
        ...step,
        card_id: data.id
      }))
    );
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(`/admin/cards/${data.id}/edit?message=${encodeURIComponent("Template created successfully.")}`);
}

export async function updateCard(formData: FormData) {
  const auth = await requireAdmin();
  const id = textValue(formData, "id");

  if (!id) {
    redirect("/admin?error=Missing template id.");
  }

  const title = textValue(formData, "title") || "Untitled template";
  const slugInput = textValue(formData, "slug") || title;
  const updateType = updateTypeValue(formData);
  const changeSummary = textValue(formData, "changeSummary");

  const payload = {
    title,
    category: textValue(formData, "category") || "Uncategorized",
    description: textValue(formData, "description"),
    safe_example: textValue(formData, "safeExample"),
    quick_memory_rule: textValue(formData, "quickMemoryRule"),
    alert_summary: textValue(formData, "alertSummary"),
    severity: severityValue(formData),
    is_free: checkedValue(formData, "isFree"),
    credit_cost: Math.max(0, numberValue(formData, "creditCost", 0)),
    is_published: checkedValue(formData, "isPublished"),
    is_new_alert: checkedValue(formData, "isNewAlert"),
    is_trending_alert: checkedValue(formData, "isTrendingAlert"),
    is_most_reported: checkedValue(formData, "isMostReported"),
    current_version: Math.max(1, numberValue(formData, "currentVersion", 1)),
    major_update_reunlock_cost: textValue(formData, "majorUpdateReunlockCost")
      ? Math.max(0, numberValue(formData, "majorUpdateReunlockCost", 0))
      : null
  };

  if (payload.is_free) {
    payload.credit_cost = 0;
  }

  const steps = [
    ...linesToSteps(textValue(formData, "howItWorks"), "how_it_works"),
    ...linesToSteps(textValue(formData, "redFlags"), "red_flags"),
    ...linesToSteps(textValue(formData, "protection"), "protection")
  ];

  if (payload.is_published) {
    const errors = validateCardForPublish({
      ...payload,
      steps
    });

    if (errors.length) {
      redirect(`/admin/cards/${id}/edit?error=${encodeURIComponent(errors[0])}`);
    }
  }

  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const index = db.cards.findIndex((card) => card.id === id);

    if (index < 0) {
      redirect("/admin?error=Template not found.");
    }

    const slug = await ensureUniqueLocalSlug(db.cards.map((card) => ({ id: card.id, slug: card.slug })), slugInput, id);
    const current = db.cards[index];
    const oldVersion = current.current_version;
    const versionChanged = payload.current_version !== oldVersion;

    if (updateType === "major" && payload.current_version <= oldVersion) {
      redirect(`/admin/cards/${id}/edit?error=${encodeURIComponent("Major updates must increase the current version.")}`);
    }

    if (versionChanged && !changeSummary) {
      redirect(`/admin/cards/${id}/edit?error=${encodeURIComponent("Add a change summary whenever you change the card version.")}`);
    }

    db.cards[index] = {
      ...current,
      ...payload,
      slug,
      updated_at: new Date().toISOString(),
      steps: steps.map((step) => ({
        id: crypto.randomUUID(),
        card_id: id,
        ...step
      }))
    };

    if (changeSummary) {
      db.card_update_logs.unshift({
        id: crypto.randomUUID(),
        card_id: id,
        old_version: oldVersion,
        new_version: payload.current_version,
        update_type: updateType,
        change_summary: changeSummary,
        reunlock_cost: updateType === "major" ? payload.major_update_reunlock_cost : null,
        created_by: auth.user?.id ?? null,
        created_at: new Date().toISOString()
      });
    }

    await writeLocalDb(db);
    revalidatePath("/admin");
    revalidatePath(`/admin/cards/${id}/edit`);
    revalidatePath("/dashboard");
    revalidatePath(`/cards/${slug}`);
    redirect(`/admin/cards/${id}/edit?message=${encodeURIComponent("Template saved successfully.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingCard } = await supabase
    .from("scam_cards")
    .select("current_version")
    .eq("id", id)
    .maybeSingle();

  if (!existingCard) {
    redirect("/admin?error=Template not found.");
  }

  const oldVersion = existingCard.current_version;
  const versionChanged = payload.current_version !== oldVersion;

  if (updateType === "major" && payload.current_version <= oldVersion) {
    redirect(`/admin/cards/${id}/edit?error=${encodeURIComponent("Major updates must increase the current version.")}`);
  }

  if (versionChanged && !changeSummary) {
    redirect(`/admin/cards/${id}/edit?error=${encodeURIComponent("Add a change summary whenever you change the card version.")}`);
  }

  const slug = await ensureUniqueSlug(supabase, slugInput, id);
  const { error } = await supabase.from("scam_cards").update({ ...payload, slug }).eq("id", id);

  if (error) {
    redirect(`/admin/cards/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("scam_card_steps").delete().eq("card_id", id);

  if (steps.length) {
    await supabase.from("scam_card_steps").insert(
      steps.map((step) => ({
        ...step,
        card_id: id
      }))
    );
  }

  if (changeSummary) {
    await supabase.from("card_update_logs").insert({
      card_id: id,
      old_version: oldVersion,
      new_version: payload.current_version,
      update_type: updateType,
      change_summary: changeSummary,
      reunlock_cost: updateType === "major" ? payload.major_update_reunlock_cost : null,
      created_by: auth.user?.id ?? null
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/cards/${id}/edit`);
  revalidatePath("/dashboard");
  revalidatePath(`/cards/${slug}`);
  redirect(`/admin/cards/${id}/edit?message=${encodeURIComponent("Template saved successfully.")}`);
}

export async function deleteCard(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id");

  if (!id) {
    redirect("/admin?error=Missing template id.");
  }

  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    db.cards = db.cards.filter((card) => card.id !== id);
    await writeLocalDb(db);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    redirect("/admin?message=Template deleted.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("scam_cards").delete().eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?message=Template deleted.");
}

export async function togglePublishCard(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id");
  const nextState = textValue(formData, "nextState") === "true";

  if (!id) {
    redirect("/admin?error=Missing template id.");
  }

  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const index = db.cards.findIndex((card) => card.id === id);

    if (index < 0) {
      redirect("/admin?error=Template not found.");
    }

    if (nextState) {
      const current = db.cards[index];
      const errors = validateCardForPublish({
        title: current.title,
        category: current.category,
        description: current.description,
        safe_example: current.safe_example,
        quick_memory_rule: current.quick_memory_rule,
        alert_summary: current.alert_summary,
        is_new_alert: current.is_new_alert,
        is_trending_alert: current.is_trending_alert,
        is_most_reported: current.is_most_reported,
        steps: current.steps.map((step) => ({
          step_type: step.step_type,
          content: step.content
        }))
      });

      if (errors.length) {
        redirect(`/admin?error=${encodeURIComponent(errors[0])}`);
      }
    }

    db.cards[index] = {
      ...db.cards[index],
      is_published: nextState,
      updated_at: new Date().toISOString()
    };

    await writeLocalDb(db);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    redirect(`/admin?message=${encodeURIComponent(nextState ? "Template published." : "Template moved to draft.")}`);
  }

  const supabase = await createSupabaseServerClient();
  if (nextState) {
    const [{ data: card }, { data: steps }] = await Promise.all([
      supabase
        .from("scam_cards")
        .select("title, category, description, safe_example, quick_memory_rule, alert_summary, is_new_alert, is_trending_alert, is_most_reported")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("scam_card_steps")
        .select("step_type, content")
        .eq("card_id", id)
    ]);

    if (!card) {
      redirect("/admin?error=Template not found.");
    }

    const errors = validateCardForPublish({
      ...card,
      steps: steps ?? []
    });

    if (errors.length) {
      redirect(`/admin?error=${encodeURIComponent(errors[0])}`);
    }
  }

  const { error } = await supabase
    .from("scam_cards")
    .update({ is_published: nextState })
    .eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(`/admin?message=${encodeURIComponent(nextState ? "Template published." : "Template moved to draft.")}`);
}

function getSelectedIds(formData: FormData) {
  return formData
    .getAll("ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function validateCardsForBulkPublish(ids: string[]) {
  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();
    const cards = db.cards.filter((card) => ids.includes(card.id));

    for (const card of cards) {
      const errors = validateCardForPublish({
        title: card.title,
        category: card.category,
        description: card.description,
        safe_example: card.safe_example,
        quick_memory_rule: card.quick_memory_rule,
        alert_summary: card.alert_summary,
        is_new_alert: card.is_new_alert,
        is_trending_alert: card.is_trending_alert,
        is_most_reported: card.is_most_reported,
        steps: card.steps.map((step) => ({
          step_type: step.step_type,
          content: step.content
        }))
      });

      if (errors.length) {
        return `${card.title || "Untitled template"}: ${errors[0]}`;
      }
    }

    return null;
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: cards }, { data: steps }] = await Promise.all([
    supabase
      .from("scam_cards")
      .select("id, title, category, description, safe_example, quick_memory_rule, alert_summary, is_new_alert, is_trending_alert, is_most_reported")
      .in("id", ids),
    supabase
      .from("scam_card_steps")
      .select("card_id, step_type, content")
      .in("card_id", ids)
  ]);

  const stepsByCard = new Map<string, Array<{ step_type: "how_it_works" | "red_flags" | "protection"; content: string }>>();
  (steps ?? []).forEach((step) => {
    const current = stepsByCard.get(step.card_id) ?? [];
    current.push({
      step_type: step.step_type,
      content: step.content
    });
    stepsByCard.set(step.card_id, current);
  });

  for (const card of cards ?? []) {
    const errors = validateCardForPublish({
      ...card,
      steps: stepsByCard.get(card.id) ?? []
    });

    if (errors.length) {
      return `${card.title || "Untitled template"}: ${errors[0]}`;
    }
  }

  return null;
}

export async function bulkUpdateCards(formData: FormData) {
  await requireAdmin();

  const ids = getSelectedIds(formData);
  const action = textValue(formData, "bulkAction");

  if (!ids.length) {
    redirect("/admin?error=Select at least one template first.");
  }

  if (!["publish", "draft", "delete"].includes(action)) {
    redirect("/admin?error=Choose a valid bulk action.");
  }

  if (action === "publish") {
    const validationError = await validateCardsForBulkPublish(ids);

    if (validationError) {
      redirect(`/admin?error=${encodeURIComponent(validationError)}`);
    }
  }

  if (!isSupabaseConfigured()) {
    const db = await readLocalDb();

    if (action === "delete") {
      db.cards = db.cards.filter((card) => !ids.includes(card.id));
    } else {
      db.cards = db.cards.map((card) =>
        ids.includes(card.id)
          ? {
              ...card,
              is_published: action === "publish",
              updated_at: new Date().toISOString()
            }
          : card
      );
    }

    await writeLocalDb(db);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    redirect(
      `/admin?message=${encodeURIComponent(
        action === "delete"
          ? `${ids.length} template${ids.length === 1 ? "" : "s"} deleted.`
          : action === "publish"
            ? `${ids.length} template${ids.length === 1 ? "" : "s"} published.`
            : `${ids.length} template${ids.length === 1 ? "" : "s"} moved to draft.`
      )}`
    );
  }

  const supabase = await createSupabaseServerClient();

  if (action === "delete") {
    const { error } = await supabase.from("scam_cards").delete().in("id", ids);

    if (error) {
      redirect(`/admin?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase
      .from("scam_cards")
      .update({ is_published: action === "publish" })
      .in("id", ids);

    if (error) {
      redirect(`/admin?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(
    `/admin?message=${encodeURIComponent(
      action === "delete"
        ? `${ids.length} template${ids.length === 1 ? "" : "s"} deleted.`
        : action === "publish"
          ? `${ids.length} template${ids.length === 1 ? "" : "s"} published.`
          : `${ids.length} template${ids.length === 1 ? "" : "s"} moved to draft.`
    )}`
  );
}

async function ensureUniqueLocalSlug(
  cards: Array<{ id: string; slug: string }>,
  rawSlug: string,
  currentId?: string
) {
  const baseSlug = slugify(rawSlug);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const found = cards.find((card) => card.slug === slug);

    if (!found || found.id === currentId) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}
