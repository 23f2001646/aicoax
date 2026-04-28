/**
 * Supabase client with graceful localStorage fallback.
 * Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable.
 *
 * Required Supabase tables (run in SQL editor):
 *
 * create table moods (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id text not null,
 *   date text not null,
 *   score int not null,
 *   emotion text,
 *   note text,
 *   created_at timestamptz default now()
 * );
 *
 * create table habits (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id text not null,
 *   name text not null,
 *   emoji text,
 *   color text,
 *   created_at timestamptz default now()
 * );
 *
 * create table habit_logs (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id text not null,
 *   habit_id text not null,
 *   date text not null,
 *   created_at timestamptz default now()
 * );
 *
 * create table gratitude (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id text not null,
 *   date text not null,
 *   items jsonb not null,
 *   created_at timestamptz default now()
 * );
 *
 * create table groups_messages (
 *   id uuid default gen_random_uuid() primary key,
 *   room text not null,
 *   anon_name text not null,
 *   anon_emoji text not null,
 *   content text not null,
 *   flagged boolean default false,
 *   created_at timestamptz default now()
 * );
 *
 * -- Enable RLS (Row Level Security) and add policies as needed
 * alter table moods enable row level security;
 * alter table habits enable row level security;
 * alter table habit_logs enable row level security;
 * alter table gratitude enable row level security;
 * alter table groups_messages enable row level security;
 *
 * -- Public read/insert for groups (anonymous)
 * create policy "groups public read" on groups_messages for select using (true);
 * create policy "groups public insert" on groups_messages for insert with check (true);
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  URL && KEY ? createClient(URL, KEY) : null;

export const hasSupabase = !!supabase;

/* ── Generic helpers ───────────────────────────────── */

/** Insert a row, returns null if no Supabase configured */
export async function dbInsert(table: string, data: Record<string, unknown>) {
  if (!supabase) return null;
  const { data: d, error } = await supabase.from(table).insert(data).select().single();
  if (error) console.warn("Supabase insert error:", error.message);
  return d;
}

/** Upsert a row */
export async function dbUpsert(table: string, data: Record<string, unknown>, onConflict?: string) {
  if (!supabase) return null;
  const q = supabase.from(table).upsert(data);
  if (onConflict) q.eq(onConflict, (data as Record<string, string>)[onConflict]);
  const { data: d, error } = await q.select().single();
  if (error) console.warn("Supabase upsert error:", error.message);
  return d;
}

/** Select rows */
export async function dbSelect(table: string, filters: Record<string, unknown> = {}) {
  if (!supabase) return null;
  let q = supabase.from(table).select("*");
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) console.warn("Supabase select error:", error.message);
  return data;
}

/** Delete rows */
export async function dbDelete(table: string, filters: Record<string, unknown>) {
  if (!supabase) return null;
  let q = supabase.from(table).delete();
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { error } = await q;
  if (error) console.warn("Supabase delete error:", error.message);
  return !error;
}
