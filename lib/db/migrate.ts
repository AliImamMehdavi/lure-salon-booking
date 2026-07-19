import "server-only";
import fs from "fs";
import path from "path";
import { query } from "@/lib/db/pool";

let migrated = false;

// Runs schema.sql (all CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT
// EXISTS) once per server process. Safe to call at the top of every data
// function — after the first successful run in a given process, it's a
// no-op flag check, not a repeated round trip.
export async function ensureMigrated(): Promise<void> {
  if (migrated) return;
  const sql = fs.readFileSync(path.join(process.cwd(), "lib/db/schema.sql"), "utf-8");
  await query(sql);
  migrated = true;
}
