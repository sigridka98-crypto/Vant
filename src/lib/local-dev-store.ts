import { promises as fs } from "fs";
import path from "path";

type LocalCardRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  safe_example: string;
  quick_memory_rule: string;
  category: string;
  severity: "common" | "trending" | "high_risk";
  is_free: boolean;
  credit_cost: number;
  current_version: number;
  major_update_reunlock_cost: number | null;
  is_published: boolean;
  is_new_alert: boolean;
  is_trending_alert: boolean;
  is_most_reported: boolean;
  alert_summary: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  steps: Array<{
    id: string;
    card_id: string;
    step_type: "how_it_works" | "red_flags" | "protection";
    content: string;
    sort_order: number;
  }>;
};

type LocalCardUpdateLogRecord = {
  id: string;
  card_id: string;
  old_version: number;
  new_version: number;
  update_type: "minor" | "major";
  change_summary: string;
  reunlock_cost: number | null;
  created_by: string | null;
  created_at: string;
};

type LocalDb = {
  cards: LocalCardRecord[];
  card_update_logs: LocalCardUpdateLogRecord[];
};

const DB_PATH = path.join(process.cwd(), "data", "local-dev-db.json");

async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify({ cards: [], card_update_logs: [] }, null, 2), "utf8");
  }
}

export async function readLocalDb(): Promise<LocalDb> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(raw) as Partial<LocalDb>;
  return {
    cards: parsed.cards ?? [],
    card_update_logs: parsed.card_update_logs ?? []
  };
}

export async function writeLocalDb(db: LocalDb) {
  await ensureDbFile();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export type { LocalCardRecord, LocalCardUpdateLogRecord };
