export const QURAN_API_BASE = "https://api.alquran.cloud/v1";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface Reciter {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface TimingData {
  verse_key: string;
  segments: [number, number, number][]; // [word_index, start_time, end_time]
}

export async function fetchSurahs(): Promise<Surah[]> {
  const response = await fetch(`${QURAN_API_BASE}/surah`);
  const data = await response.json();
  return data.data;
}

export async function fetchAyahs(surahNumber: number): Promise<Ayah[]> {
  const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/quran-uthmani`);
  const data = await response.json();
  return data.data.ayahs;
}

export async function fetchReciters(): Promise<Reciter[]> {
  const response = await fetch(`${QURAN_API_BASE}/edition?format=audio&language=ar&type=versebyverse`);
  const data = await response.json();
  return data.data;
}

export function getAudioUrl(reciterIdentifier: string, surahNumber: number, ayahNumberInSurah: number): string {
  const s = surahNumber.toString().padStart(3, "0");
  const a = ayahNumberInSurah.toString().padStart(3, "0");
  return `https://everyayah.com/data/${reciterIdentifier}/${s}${a}.mp3`;
}

// Fetching timing data from Quran.com API (Audio Segments)
export async function fetchTimingData(surahNumber: number, ayahNumberInSurah: number, reciterId: number): Promise<TimingData | null> {
  try {
    const response = await fetch(`https://api.quran.com/api/v4/audio/reciters/${reciterId}/audio_files?chapter_number=${surahNumber}`);
    const data = await response.json();
    const audioFile = data.audio_files[0];
    if (!audioFile || !audioFile.verse_timings) return null;
    
    const verseKey = `${surahNumber}:${ayahNumberInSurah}`;
    const timing = audioFile.verse_timings.find((t: any) => t.verse_key === verseKey);
    return timing || null;
  } catch (error) {
    console.error("Error fetching timing data:", error);
    return null;
  }
}
