# LFG Superpower Ad Copy Generator

A Next.js application that uses Google's Gemini AI to transcribe and analyze video and image content, and Anthropic's Claude AI to generate marketing ad copy using Eugene Schwartz's Problem-Solution Framework.

## Features

- Google OAuth authentication for secure access
- Upload videos (MP4, MOV, AVI) or images via drag-and-drop
- AI-powered video transcription and analysis
- Image description and visual element identification
- Claude AI-generated marketing copy targeting Superpower's preventive health testing service
- Local storage persistence for analysis results
- Modern, responsive UI with dark mode support

## Tech Stack

- **Frontend**: React with Next.js 15
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI**: Google Gemini 2.5 Flash & Anthropic Claude Sonnet 4
- **Authentication**: NextAuth v5 with Google OAuth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (get one at https://makersuite.google.com/app/apikey)
- An Anthropic API key (get one at https://console.anthropic.com/)
- Google OAuth 2.0 credentials (see setup instructions below)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up Google OAuth credentials:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Save your Client ID and Client Secret

3. Set up environment variables:

   - Copy `.env.local.example` to `.env.local`
   - Fill in all required values:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   AUTH_SECRET=generate_with_openssl_rand_base64_32
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser and sign in with Google

## Usage

1. Sign in with your Google account
2. Upload a video (MP4, MOV, AVI) or image file via drag-and-drop or file selection
3. The app will automatically:
   - Analyze the media using Gemini AI
   - Generate marketing ad copy using Claude AI
   - Save results to local storage
4. View results in the grid:
   - For videos: transcript, scene descriptions, and generated ad copy
   - For images: visual elements, existing ad copy, and generated marketing copy
5. Click any completed result to view detailed analysis
6. Sign out when finished using the button in the top-right corner

## Limitations

- Supported formats: MP4, MOV, AVI (videos), JPEG, PNG (images)
- File size limit: 100MB
- Processing time depends on media length and complexity (30 seconds to 5 minutes)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze-video/
│   │   │   └── route.ts          # API endpoint for media processing
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth API route handler
│   ├── signin/
│   │   └── page.tsx              # Sign-in page
│   ├── layout.tsx                # Root layout with SessionProvider
│   ├── page.tsx                  # Main page component
│   └── globals.css               # Global styles
├── components/
│   ├── VideoUpload.tsx           # Media upload component
│   ├── SavedResultsGrid.tsx      # Results grid display
│   ├── VideoResultDetailModal.tsx    # Video result modal
│   ├── ImageResultDetailModal.tsx    # Image result modal
│   ├── Header.tsx                # User profile and sign-out
│   └── SessionProvider.tsx       # NextAuth session wrapper
├── lib/
│   ├── gemini.ts                 # Gemini AI integration
│   ├── claude.ts                 # Claude AI integration
│   └── storage.ts                # LocalStorage utilities
├── auth.ts                       # NextAuth configuration
├── middleware.ts                 # Auth middleware for route protection
└── tmp/                          # Temporary file storage (auto-created)
```

## Development

To build for production:

```bash
npm run build
npm start
```

## License

MIT
