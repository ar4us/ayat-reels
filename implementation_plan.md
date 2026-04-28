# Quran Video Generator - Implementation Plan

## 🏗️ Architecture Overview

The application follows a modern full-stack architecture using Next.js 14/15.

### 1. Frontend (Next.js App Router)
- **UI/UX**: Clean Islamic aesthetic with dark/green theme (`#050a06` background).
- **Interactions**: Framer Motion for smooth transitions and Lucide React for iconography.
- **State Management**: React `useState` and `useEffect` for handling Quran data and video status.
- **Preview Engine**: Real-time text overlay on a simulated video player before generation.

### 2. Backend (Next.js API Routes)
- **`POST /api/generate`**: Orchestrates the video creation process.
- **FFmpeg Engine**: server-side processing using `fluent-ffmpeg`.
- **RTL Support**: Custom Arabic text reshaping and Bidi reordering to ensure perfect rendering in FFmpeg.

### 3. Video Generation Pipeline
1.  **Data Fetching**: Retrieves Ayah text and audio URL from AlQuran Cloud.
2.  **Text Processing**: Uses `arabic-reshaper` and `bidi-js` for RTL compatibility.
3.  **Subtitling**: Generates `.ass` (Advanced Substation Alpha) files for high-quality, synced text.
4.  **FFmpeg Compositing**:
    - Creates a background (solid color or image).
    - Overlays the shaped Arabic text.
    - Adds audio and syncs everything.
    - Exports 1080x1920 MP4 (9:16).

## 🚀 Key Features
- [x] **Surah & Ayah Selection**: Browse the entire Quran.
- [x] **Reciter Choice**: Choose from multiple world-class reciters.
- [x] **Live Preview**: See how the text looks before committing to render.
- [x] **Islamic Themes**: Dark, Gold, and Minimal styles.
- [x] **RTL Perfection**: Full support for Arabic ligatures and direction.
- [x] **AI Suggestion**: "Surprise Me" button for curated popular ayahs.

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: TailwindCSS
- **Video**: FFmpeg (via `fluent-ffmpeg`)
- **Text**: `arabic-reshaper`, `bidi-js`
- **Animations**: `framer-motion`
- **Notifications**: `react-hot-toast`

## 📋 Next Steps
1.  **Configure Redis**: To enable BullMQ for background processing in production.
2.  **Add Background Videos**: Allow users to upload or select nature/abstract background videos.
3.  **Word-by-Word Timing**: Integrate Quran.com timing segments for karaoke-style highlighting.
