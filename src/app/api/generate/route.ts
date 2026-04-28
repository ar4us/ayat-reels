import { NextRequest, NextResponse } from 'next/server';
import { fetchAyahs, getAudioUrl } from '@/lib/quran-api';
import { generateVideo } from '@/lib/video-generator';
import { VideoGenerationConfig } from '@/types';

import { put } from '@vercel/blob';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const config: VideoGenerationConfig = await req.json();
    
    // 1. Fetch Ayah Text
    const ayahs = await fetchAyahs(config.surahNumber);
    const selectedAyah = ayahs.find(a => a.numberInSurah === config.ayahNumber);
    
    if (!selectedAyah) {
      return NextResponse.json({ error: "Ayah not found" }, { status: 404 });
    }

    // 2. Get Audio URL
    const audioUrl = getAudioUrl(config.reciterIdentifier, config.surahNumber, config.ayahNumber);

    // 3. Generate Video (returns local path in /tmp)
    const localVideoPath = await generateVideo(config, audioUrl, selectedAyah.text, null) as string;

    // 4. Upload to Vercel Blob (for production)
    const fileBuffer = fs.readFileSync(localVideoPath);
    const blob = await put(`reels/${config.surahNumber}_${config.ayahNumber}.mp4`, fileBuffer, {
      access: 'public',
      contentType: 'video/mp4'
    });

    // Cleanup local file
    try { fs.unlinkSync(localVideoPath); } catch (e) {}

    return NextResponse.json({ videoUrl: blob.url });
  } catch (error: any) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
  }
}
