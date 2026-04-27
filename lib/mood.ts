export interface MoodEntry {
  date: string; // ISO
  score: number; // 1-10
  emotion: string;
  note: string;
}

export function getMoods(): MoodEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("aicoax_moods") || "[]"); } catch { return []; }
}

export function saveMood(entry: MoodEntry) {
  const moods = getMoods();
  // replace today if exists
  const today = new Date().toDateString();
  const filtered = moods.filter((m) => new Date(m.date).toDateString() !== today);
  filtered.push(entry);
  localStorage.setItem("aicoax_moods", JSON.stringify(filtered.slice(-90)));
}

export function getTodayMood(): MoodEntry | null {
  const moods = getMoods();
  const today = new Date().toDateString();
  return moods.find((m) => new Date(m.date).toDateString() === today) || null;
}
