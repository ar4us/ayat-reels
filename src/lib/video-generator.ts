const ffmpeg = require('fluent-ffmpeg');
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import os from 'os';
import { VideoGenerationConfig } from '../types';

const localFfmpegPath = path.join(process.cwd(), 'src', 'lib', 'bin', 'ffmpeg.exe');
const localFfprobePath = path.join(process.cwd(), 'src', 'lib', 'bin', 'ffprobe.exe');

// In Vercel, we use ffmpeg-static. In local dev (Windows), we might use the .exe
let ffmpegPath: string, ffprobePath: string;
try {
  ffmpegPath = require('ffmpeg-static');
  ffprobePath = require('ffprobe-static');
} catch (e) {
  ffmpegPath = localFfmpegPath;
  ffprobePath = localFfprobePath;
}

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);

// @ts-ignore
const { reshape } = require('arabic-reshaper');
// @ts-ignore
const bidi = require('bidi-js');

export async function generateVideo(config: VideoGenerationConfig, audioUrl: string, ayahText: string, timingData: any) {
  // Use /tmp for serverless environments
  const tempDir = os.tmpdir();
  const jobId = Math.random().toString(36).substring(7);
  const audioFile = path.join(tempDir, `${jobId}_audio.mp3`);
  const subtitleFile = path.join(tempDir, `${jobId}_subs.ass`);
  const outputFile = path.join(tempDir, `${jobId}_output.mp4`);
  
  // Font path needs to be absolute
  const fontPath = path.join(process.cwd(), 'src', 'lib', 'Amiri-Regular.ttf');

  // 1. Download audio
  const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(audioFile, audioResponse.data);

  // Get audio duration
  const duration = await getAudioDuration(audioFile);

  // 2. Prepare Arabic Text (Reshape and Bidi)
  const reshapedText = reshape(ayahText);
  const bidiText = bidi().getReorderedText(reshapedText);

  // 3. Generate ASS Subtitles
  const assContent = generateASS(bidiText, duration);
  fs.writeFileSync(subtitleFile, assContent);

  // 4. Background Color based on theme
  const bgColor = config.theme === 'dark' ? '#050a06' : config.theme === 'gold' ? '#1a1a00' : '#ffffff';
  const textColor = config.theme === 'minimal' ? 'black' : 'white';

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`color=c=${bgColor}:s=1080x1920:d=${duration}`)
      .inputOptions(['-f', 'lavfi'])
      .input(audioFile)
      .complexFilter([
        {
          filter: 'subtitles',
          options: {
            filename: subtitleFile.replace(/\\/g, '/').replace(':', '\\:'),
            force_style: `FontName=Amiri,FontSize=32,PrimaryColour=${textColor === 'white' ? '&H00FFFFFF&' : '&H00000000&'},Alignment=2`
          },
          inputs: '0:v',
          outputs: 'v1'
        },
        ...(config.watermark !== false ? [{
          filter: 'drawtext',
          options: {
            text: 'AyatReels',
            fontcolor: 'white@0.3',
            fontsize: 24,
            x: '(w-text_w)/2',
            y: 'h-100',
            fontfile: fontPath.replace(/\\/g, '/')
          },
          inputs: 'v1',
          outputs: 'v2'
        }] : [{
          filter: 'copy',
          inputs: 'v1',
          outputs: 'v2'
        }])
      ])
      .map('v2')
      .map('1:a')
      .outputOptions([
        '-c:v libx264',
        '-preset ultrafast',
        '-crf 28', // Slightly higher CRF for speed on serverless
        '-c:a aac',
        '-shortest',
        '-pix_fmt yuv420p'
      ])
      .on('start', (cmd) => console.log('FFmpeg command:', cmd))
      .on('end', async () => {
        // ON VERCEL: We would upload to S3 here.
        // For now, we'll try to return a temporary URL if possible, 
        // but Vercel doesn't serve /tmp files.
        // We MUST use S3.
        resolve(outputFile); // This will need to be handled by the API to serve or upload
      })
      .on('error', (err) => {
        console.error("FFmpeg error:", err);
        reject(err);
      })
      .save(outputFile);
  });
}

async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration || 10);
    });
  });
}

function generateASS(text: string, duration: number) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Amiri,60,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,100,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const startTime = "0:00:00.00";
  const endTime = formatTime(duration);

  return header + `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,{\\fad(500,500)}{\\q2}${text}`;
}
