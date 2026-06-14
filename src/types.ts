export interface Note {
  id: string; // Dynamic UUID
  title: string;
  content: string;
  color: string; // Hex color or pre-defined theme name
  x: number; // Pixels from left
  y: number; // Pixels from top
  width: number; // Pixels width
  height: number; // Pixels height
  isPinned: boolean; // Keep pinned
  isMinimized: boolean; // Header-only collapsed view
  zIndex: number; // Overlay stack index
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type NoteColor = {
  name: string;
  bg: string;
  border: string;
  text: string;
  handle: string;
  accent: string;
};

export const NOTE_COLORS: NoteColor[] = [
  {
    name: "Obsidian Noir",
    bg: "rgba(18, 18, 18, 0.95)", // #121212 glass vibe
    border: "border-slate-800",
    text: "text-slate-200",
    handle: "bg-[#1a1a1a]",
    accent: "#10b981", // emerald matching the theme specs
  },
  {
    name: "Emerald Jade",
    bg: "rgba(6, 78, 59, 0.95)", // dark green
    border: "border-emerald-600/40",
    text: "text-emerald-100",
    handle: "bg-emerald-950/80",
    accent: "#34d399",
  },
  {
    name: "Sapphire Dusk",
    bg: "rgba(17, 24, 39, 0.95)", // blueish dark
    border: "border-blue-950",
    text: "text-slate-150",
    handle: "bg-slate-900",
    accent: "#3b82f6",
  },
  {
    name: "Mystic Violet",
    bg: "rgba(88, 28, 135, 0.95)", // deep purple dark
    border: "border-purple-900/40",
    text: "text-purple-100",
    handle: "bg-purple-950/70",
    accent: "#c084fc",
  },
  {
    name: "Amber Glow",
    bg: "rgba(230, 150, 0, 0.15)", // golden gloss dark
    border: "border-amber-500/25",
    text: "text-amber-100",
    handle: "bg-amber-950/60",
    accent: "#fbbf24",
  },
  {
    name: "Crimson Spark",
    bg: "rgba(153, 27, 27, 0.95)", // deep ruby red
    border: "border-red-900/40",
    text: "text-red-100",
    handle: "bg-red-950/80",
    accent: "#f87171",
  }
];
