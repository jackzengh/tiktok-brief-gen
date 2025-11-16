# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for analyzing video and image content using AI. The app uses Google's Gemini AI for media transcription and analysis, and Anthropic's Claude AI for generating marketing ad copy using Eugene Schwartz's Problem-Solution Framework.

**Core Functionality:**
- Upload videos (MP4, MOV, AVI) or images for AI analysis
- Video analysis: transcription, scene descriptions, visual element identification
- Image analysis: description, visual elements, existing ad copy extraction
- AI-generated marketing copy targeting Superpower's preventive health testing service
- Local storage persistence for analysis results

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
Two API keys are required in `.env.local`:
- `GEMINI_API_KEY` - Google Gemini API key (get at https://makersuite.google.com/app/apikey)
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

## Architecture

### File Upload & Processing Flow
1. **Client** (`app/page.tsx`) → User uploads media file
2. **API Route** (`app/api/analyze-video/route.ts`) → Receives file, saves to temp storage
3. **Gemini Analysis** (`lib/gemini.ts`) → Analyzes video/image, returns structured data
4. **Claude Ad Copy** (`lib/claude.ts`) → Generates marketing copy from Gemini results
5. **Client Storage** (`lib/storage.ts`) → Saves results to browser localStorage
6. **UI Display** → Shows results in grid with detail modals

### Key Technical Details

**Temporary File Handling:**
- Local dev: Uses `./tmp` directory in project root
- Production (Vercel/Lambda): Uses `/tmp` directory
- Files are automatically cleaned up after processing

**API Route Configuration:**
The `/api/analyze-video` route has special configuration in `vercel.json`:
- `maxDuration: 300` (5 minutes) - Required for video processing
- `memory: 1024` - Allocated memory for large file uploads
- Body size limit: 100MB (configured in `next.config.ts`)

**Gemini File Processing:**
Videos must be uploaded to Gemini's file API and reach "ACTIVE" state before analysis. The code polls for up to 30 seconds with 5-second intervals (`lib/gemini.ts:56-69`).

**Type Discrimination:**
Results use discriminated unions:
- `VideoAnalysisResult` has `transcript` and `scenes` fields
- `ImageAnalysisResult` has `adCopy` and `visualElements` fields
- Both can include optional `claudeAdCopy` field
- Storage types add `id`, `timestamp`, `fileName`, and `type` fields

### Component Structure
- `VideoUpload.tsx` - Drag-and-drop media upload (handles both video and images)
- `SavedResultsGrid.tsx` - Grid display of all saved analysis results
- `VideoResultDetailModal.tsx` - Modal for detailed video analysis view
- `ImageResultDetailModal.tsx` - Modal for detailed image analysis view

### Import Aliases
Uses `@/*` for all imports (configured in `tsconfig.json`):
```typescript
import { analyzeVideo } from "@/lib/gemini";
import MediaUpload from "@/components/VideoUpload";
```

## AI Integration Details

### Gemini (Video/Image Analysis)
- Model: `gemini-2.5-flash`
- Videos: Uploaded to Gemini file API, must wait for ACTIVE state
- Images: Sent as base64 inline data
- Responses are JSON with fallback text parsing

### Claude (Ad Copy Generation)
- Model: `claude-sonnet-4-20250514`
- Uses tool calling with `ad_copy` tool for structured output
- Prompt includes detailed Superpower brand guidelines and Eugene Schwartz framework
- Web search tool enabled (max 5 uses) for up-to-date context
- Falls back to JSON extraction from text if tool not used

### Ad Copy Strategy
All generated copy follows single-concept Problem-Solution framework:
1. **Problem Awareness** (30-40%): Identify specific pain point
2. **Problem Agitation** (20-30%): Deepen the problem understanding
3. **Solution Introduction** (30-40%): Present Superpower as the answer
4. **Call to Action**: "Start today at superpower.com"

Target ICPs: Performance Optimizers, Worried Well, Data-Driven Professionals, Parents/Family-Focused, Biohackers

## Common Development Patterns

### Adding New Media Types
When supporting new media formats:
1. Update mime type validation in `app/api/analyze-video/route.ts:24-32`
2. Add new analysis function in `lib/gemini.ts` (follow `analyzeVideo`/`analyzeImage` patterns)
3. Create corresponding result interface with discriminated union
4. Add new modal component if display differs significantly

### Modifying AI Prompts
- Gemini prompts: `lib/gemini.ts:78-93` (video), `lib/gemini.ts:197-214` (image)
- Claude prompt: `lib/claude.ts:51-210` (includes full brand guidelines)
- Both use JSON response format with fallback parsing

### Storage Schema Changes
If changing result structure:
1. Update interfaces in `lib/gemini.ts` or `lib/storage.ts`
2. Consider localStorage migration for existing users
3. Update modal components to handle new fields
