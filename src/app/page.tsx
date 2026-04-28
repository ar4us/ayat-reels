'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Settings, Video, Check, Loader2, Music, Type, Sparkles } from 'lucide-react';
import { fetchSurahs, fetchAyahs, fetchReciters, Surah, Ayah, Reciter } from '@/lib/quran-api';
import { POPULAR_AYAHS } from '@/lib/constants';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [selectedReciter, setSelectedReciter] = useState<string>('Alafasy');
  const [theme, setTheme] = useState<'dark' | 'gold' | 'minimal'>('dark');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentAyahText, setCurrentAyahText] = useState<string>('');

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [s, r] = await Promise.all([fetchSurahs(), fetchReciters()]);
        setSurahs(s);
        setReciters(r);
      } catch (error) {
        toast.error("Failed to load data");
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    async function loadAyah() {
      try {
        const ayahs = await fetchAyahs(selectedSurah);
        const ayah = ayahs.find(a => a.numberInSurah === selectedAyah);
        if (ayah) setCurrentAyahText(ayah.text);
      } catch (e) {}
    }
    loadAyah();
  }, [selectedSurah, selectedAyah]);

  const handleGenerate = async () => {
    setGenerating(true);
    setVideoUrl(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: selectedSurah,
          ayahNumber: selectedAyah,
          reciterIdentifier: selectedReciter,
          theme
        })
      });
      const data = await response.json();
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        toast.success("Video generated successfully!");
      } else {
        toast.error(data.error || "Generation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
    setGenerating(false);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AyatReels
        </h1>
        <p className="text-foreground/60 mt-2">Create beautiful Quran videos in seconds</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        
        {/* Configuration Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 space-y-6"
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-lg">
            <Settings size={20} />
            <h2>Video Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Surah Selection */}
            <div>
              <label className="text-sm text-foreground/40 block mb-2">Select Surah</label>
              <select 
                className="input-field w-full"
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(Number(e.target.value))}
              >
                {surahs.map(s => (
                  <option key={s.number} value={s.number} className="bg-background text-foreground">
                    {s.number}. {s.englishName} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Ayah Selection */}
            <div>
              <label className="text-sm text-foreground/40 block mb-2">Select Ayah</label>
              <input 
                type="number" 
                className="input-field w-full"
                min={1}
                value={selectedAyah}
                onChange={(e) => setSelectedAyah(Number(e.target.value))}
              />
            </div>

            {/* Reciter Selection */}
            <div>
              <label className="text-sm text-foreground/40 block mb-2">Reciter</label>
              <div className="flex items-center gap-2">
                <Music size={18} className="text-primary" />
                <select 
                  className="input-field w-full"
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                >
                  <option value="Alafasy">Mishary Rashid Alafasy</option>
                  <option value="Abdul_Basit_Murattal_64kbps">Abdul Basit</option>
                  <option value="Minshawy_Murattal_128kbps">Al-Minshawi</option>
                </select>
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="text-sm text-foreground/40 block mb-2">Visual Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'gold', 'minimal'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`p-3 rounded-lg border transition-all capitalize ${
                      theme === t ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-foreground/60 hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Ayahs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-foreground/40 block">Quick Suggestions</label>
                <button 
                  onClick={() => {
                    const random = POPULAR_AYAHS[Math.floor(Math.random() * POPULAR_AYAHS.length)];
                    setSelectedSurah(random.surah);
                    setSelectedAyah(random.ayah);
                    toast.success(`Suggested: ${random.name}`);
                  }}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <Sparkles size={12} />
                  Surprise me
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { surah: 2, ayah: 255, name: "Ayat al-Kursi" },
                  { surah: 1, ayah: 1, name: "Al-Fatihah" },
                  { surah: 112, ayah: 1, name: "Al-Ikhlas" }
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSelectedSurah(item.surah);
                      setSelectedAyah(item.ayah);
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Advanced Features */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/60">Watermark</span>
                <button 
                  onClick={() => toast.success("Watermark toggled")}
                  className="w-10 h-5 bg-primary/20 rounded-full relative"
                >
                  <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full"></div>
                </button>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-primary">Batch Generation</h4>
                  <p className="text-xs text-foreground/40">Create 5 random reels at once</p>
                </div>
                <button 
                  onClick={() => toast.error("Batch mode coming soon!")}
                  className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors"
                >
                  Start Batch
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating || loading}
            className="btn-primary w-full mt-8"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video />
                Generate Reel
              </>
            )}
          </button>
        </motion.div>

        {/* Preview Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="aspect-[9/16] w-full max-w-[350px] mx-auto glass overflow-hidden relative group">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover"
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative p-8 text-center bg-black">
                {/* Simulated Video Preview */}
                <div className={`absolute inset-0 opacity-40 ${
                  theme === 'dark' ? 'bg-secondary' : theme === 'gold' ? 'bg-yellow-900' : 'bg-gray-200'
                }`}></div>
                
                <div className="relative z-10 w-full">
                  <p className="arabic-text text-3xl leading-relaxed mb-8 drop-shadow-lg">
                    {currentAyahText || "Select an ayah"}
                  </p>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary">
                    <Play fill="currentColor" />
                  </div>
                </div>

                <div className="absolute bottom-10 left-0 right-0 z-10 text-xs text-white/30 font-mono tracking-widest uppercase">
                  AyatReels Preview
                </div>
              </div>
            )}

            <AnimatePresence>
              {generating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center backdrop-blur-sm"
                >
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-primary font-medium animate-pulse">Rendering Ayahs...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {videoUrl && (
            <motion.a 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              href={videoUrl}
              download="ayah-reel.mp4"
              className="btn-primary w-full max-w-[350px] mx-auto bg-accent hover:bg-yellow-500"
            >
              <Download />
              Download MP4
            </motion.a>
          )}
        </motion.div>

      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-20">
        {[
          { icon: <Check className="text-primary" />, title: "High Quality", desc: "Full HD vertical video ready for TikTok/Reels" },
          { icon: <Type className="text-primary" />, title: "RTL Support", desc: "Perfect Arabic rendering with proper fonts" },
          { icon: <Music className="text-primary" />, title: "Synced Audio", desc: "Captions perfectly timed with reciter's voice" }
        ].map((feature, i) => (
          <div key={i} className="glass p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {feature.icon}
            </div>
            <h3 className="font-bold mb-2">{feature.title}</h3>
            <p className="text-foreground/40 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
