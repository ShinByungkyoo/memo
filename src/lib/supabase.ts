import { createClient } from "@supabase/supabase-js";
import { Note } from "../types";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseUrl.trim() !== "" &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== "your-anon-key" &&
    supabaseAnonKey.trim() !== ""
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Convert database snake_case note to typescript camelCase Note
export const dbToNote = (dbNote: any): Note => {
  return {
    id: dbNote.id,
    title: dbNote.title || "",
    content: dbNote.content || "",
    color: dbNote.color || "Classic Yellow",
    x: Number(dbNote.x ?? 50),
    y: Number(dbNote.y ?? 50),
    width: Number(dbNote.width ?? 280),
    height: Number(dbNote.height ?? 220),
    isPinned: !!dbNote.is_pinned,
    isMinimized: !!dbNote.is_minimized,
    zIndex: Number(dbNote.z_index ?? 1),
    createdAt: dbNote.created_at || new Date().toISOString(),
    updatedAt: dbNote.updated_at || new Date().toISOString(),
    tags: Array.isArray(dbNote.tags) ? dbNote.tags : [],
    importance: Number(dbNote.importance ?? 1),
  };
};

// Convert typescript camelCase Note to database snake_case note
export const noteToDb = (note: Note): any => {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color,
    x: note.x,
    y: note.y,
    width: note.width,
    height: note.height,
    is_pinned: note.isPinned,
    is_minimized: note.isMinimized,
    z_index: note.zIndex,
    updated_at: new Date().toISOString(),
    tags: note.tags,
    importance: note.importance || 1,
  };
};

// SQL standard schema for the user to copy
export const SCHEMA_SQL = `
-- Create floating notes table
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text not null default '',
  color text not null default 'Classic Yellow',
  x float not null default 50,
  y float not null default 50,
  width float not null default 280,
  height float not null default 220,
  is_pinned boolean not null default false,
  is_minimized boolean not null default false,
  z_index integer not null default 1,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  tags text[] not null default '{}'::text[],
  importance integer not null default 1
);

-- Enable Row Level Security (RLS) if desired, or allow public anon access:
alter table public.notes enable row level security;

-- Create policy for anon access (Simple Setup)
create policy "Allow all public anon access to notes" 
on public.notes 
for all 
using (true) 
with check (true);
`.trim();
