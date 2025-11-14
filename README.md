# Video Transcription & Analysis App

A Next.js application that uses Google's Gemini AI to transcribe and analyze video content, providing detailed descriptions of scenes, settings, and visual elements.

## Features

- Upload videos via drag-and-drop or file selection
- AI-powered video transcription
- Detailed scene and setting descriptions
- Scene-by-scene breakdown
- Modern, responsive UI with dark mode support

## Tech Stack

- **Frontend**: React with Next.js 15
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI**: Google Gemini 1.5 Pro API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (get one at https://makersuite.google.com/app/apikey)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
   - Copy `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click the upload area or drag and drop a video file (MP4, MOV, AVI)
2. Click "Analyze Video" to start processing
3. Wait for the AI to analyze your video (this may take 30-60 seconds)
4. View the results:
   - Video description (setting, environment, visual elements)
   - Scene breakdown
   - Full transcript of spoken content

## Limitations

- Maximum file size: 50MB
- Supported formats: MP4, MOV, AVI, and other common video formats
- Processing time depends on video length and complexity

## Project Structure

```
├── app/
│   ├── api/
│   │   └── analyze-video/
│   │       └── route.ts          # API endpoint for video processing
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page component
│   └── globals.css               # Global styles
├── components/
│   ├── VideoUpload.tsx           # Video upload component
│   └── VideoResults.tsx          # Results display component
├── lib/
│   └── gemini.ts                 # Gemini AI integration
└── tmp/                          # Temporary video storage (auto-created)
```

## Development

To build for production:
```bash
npm run build
npm start
```

## License

MIT
