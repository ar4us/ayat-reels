# 🚀 Deploying to Vercel

To deploy the Quran Video Generator to Vercel, follow these steps:

## 1. Setup Vercel Blob Storage
Since Vercel is serverless, generated videos cannot be saved to the local disk. We use **Vercel Blob** for cloud storage.

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project (or create a new one).
3.  Navigate to **Storage** -> **Browse Marketplace**.
4.  Search for **Blob** and click **Connect**.
5.  This will automatically add the `BLOB_READ_WRITE_TOKEN` to your environment variables.

## 2. Environment Variables
Ensure the following environment variables are set in your Vercel Project Settings:

- `BLOB_READ_WRITE_TOKEN`: (Added automatically by step 1)
- `NEXT_PUBLIC_BASE_URL`: Your production URL (e.g., `https://ayat-reels.vercel.app`)

## 3. Configuration
The project is already configured with a `vercel.json` to handle:
- **maxDuration**: 300 seconds (to allow time for FFmpeg rendering).
- **memory**: 1024 MB.

> [!IMPORTANT]
> The `maxDuration: 300` requires a **Vercel Pro** account. On the Free tier, you may experience timeouts for very long ayahs.

## 4. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Quran Video Generator"
git remote add origin <your-repo-url>
git push -u origin main
```

## 5. Deployment
Connect your GitHub repository to Vercel, and it will deploy automatically!

## 🧪 Local Testing
To test the Blob storage locally, run:
```bash
npx vercel env pull .env.local
npm run dev
```
