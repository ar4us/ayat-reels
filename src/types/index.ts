export interface VideoGenerationConfig {
  surahNumber: number;
  ayahNumber: number;
  reciterIdentifier: string;
  theme: 'dark' | 'gold' | 'minimal';
  backgroundUrl?: string;
  watermark?: boolean;
}

export interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
}
