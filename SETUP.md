# Quick Start Guide

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Open the `.env.local` file and replace the placeholder with your actual API key:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### 4. Using the Application

1. Open http://localhost:3000 in your browser
2. Drag and drop a video file or click to browse
3. Click "Analyze Video"
4. Wait for the AI to process your video (30-60 seconds)
5. View your results:
   - Video description (setting, props, lighting, atmosphere)
   - Scene breakdown
   - Full transcript

## Supported Video Formats

- MP4
- MOV
- AVI
- WebM

## Features

- **Drag & Drop Upload**: Easy video upload with drag-and-drop support
- **AI-Powered Analysis**: Uses Google's Gemini 1.5 Pro for advanced video understanding
- **Comprehensive Results**:
  - Detailed scene descriptions
  - Visual element identification
  - Complete transcription of audio
  - Scene-by-scene breakdown
- **Modern UI**: Responsive design with dark mode support
- **TypeScript**: Full type safety throughout the application

## Production Deployment

To deploy to production:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Troubleshooting

### "GEMINI_API_KEY is not set" Error

Make sure you've created the `.env.local` file and added your API key.

### Video Upload Fails

- Check that your video is under 50MB
- Ensure it's in a supported format (MP4, MOV, AVI, WebM)
- Try converting your video to MP4 if issues persist

### Slow Processing

- Large videos take longer to process
- Initial requests may be slower due to cold starts
- Typical processing time: 30-60 seconds for a 1-2 minute video

## Project Structure

```
tiktok-brief-gen/
├── app/
│   ├── api/analyze-video/   # API endpoint for video processing
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main page with upload logic
│   └── globals.css          # Global styles
├── components/
│   ├── VideoUpload.tsx      # Upload UI component
│   └── VideoResults.tsx     # Results display component
├── lib/
│   └── gemini.ts            # Gemini AI integration
└── tmp/                     # Temporary video storage
```

## Tech Stack

- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Google Gemini 1.5 Pro API
