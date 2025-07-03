# Audio Recording & Transcription Features

## Overview

This AI Clinic Assistant now includes comprehensive audio recording capabilities with automatic cloud sync and AI-powered transcription using OpenAI Whisper.

## Features Implemented

### 🎤 Mobile App (React Native)

- **High-quality audio recording** with waveform visualization
- **Automatic upload** to backend after recording completion
- **Real-time upload progress** tracking
- **Upload status indicators**: Local, Uploading, Synced, Failed
- **AI transcription display** directly in the app
- **Retry functionality** for failed uploads
- **Cross-platform support** (iOS/Android URI handling)

### ☁️ Backend (FastAPI)

- **File upload endpoint** (`/upload`) with UploadFile support
- **Supabase Storage integration** for secure file storage
- **Database recording** with complete metadata
- **OpenAI Whisper transcription** integration
- **Automatic transcript updates** in database
- **Comprehensive error handling** and logging
- **Additional endpoints** for fetching recordings

## Setup Instructions

### 1. Backend Configuration

#### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

#### Database Schema

Create a `recordings` table in your Supabase database:

```sql
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    transcript TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage Bucket

Create a storage bucket named `audio-files` in your Supabase project with public access for the uploaded files.

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Start Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Mobile App Configuration

#### Update API URL

In `mobile/app/index.tsx`, update the API base URL to point to your backend:

```typescript
const API_BASE_URL = __DEV__
  ? "http://your-backend-ip:8000" // Replace with your backend IP/domain
  : "https://your-production-api.com";
```

#### Install Dependencies

```bash
cd mobile
npm install
```

#### Start Mobile App

```bash
cd mobile
npm start
```

## How It Works

### Recording Flow

1. **User starts recording** → High-quality audio capture begins
2. **User stops recording** → Audio saved locally with timestamp
3. **Automatic upload** → File uploaded to Supabase Storage via FormData
4. **Database insertion** → Record created with metadata
5. **AI transcription** → OpenAI Whisper processes the audio
6. **Database update** → Transcript added to the record
7. **UI update** → Mobile app shows transcription and sync status

### Upload Status States

- **🔴 Local**: Recording saved locally, not yet uploaded
- **🔵 Uploading**: Currently uploading to cloud (shows progress %)
- **🟢 Synced**: Successfully uploaded and transcribed
- **🟠 Failed**: Upload failed (shows retry button)

### Error Handling

- **Network errors**: Automatic retry options
- **File format issues**: Validation and user feedback
- **Transcription failures**: Graceful degradation with error message
- **Storage errors**: Cleanup and user notification

## API Endpoints

### POST `/upload`

Upload audio file for storage and transcription

**Request**: `multipart/form-data` with audio file
**Response**:

```json
{
  "id": "uuid",
  "filename": "unique_filename.m4a",
  "url": "public_supabase_url",
  "transcript": "transcribed_text",
  "created_at": "timestamp"
}
```

### GET `/recordings`

Fetch all recordings with metadata and transcripts

### GET `/recordings/{recording_id}`

Fetch specific recording by ID

## File Handling

### Supported Formats

- Primary: `.m4a` (iOS default)
- Secondary: `.wav`, `.mp3`, `.mp4`

### Platform Differences

- **iOS**: Automatically handles `file://` URI prefixing
- **Android**: Preserves existing URI format
- **FormData**: Platform-specific MIME type detection

## Troubleshooting

### Common Issues

1. **Upload fails**: Check network connection and backend URL
2. **No transcription**: Verify OpenAI API key and quota
3. **Storage errors**: Check Supabase bucket permissions
4. **iOS/Android differences**: Ensure proper URI handling in FormData

### Debugging

Enable detailed logging by checking the console in both:

- **Mobile**: React Native debugger
- **Backend**: FastAPI logs with detailed error messages

### Environment Setup

Ensure all required services are configured:

- ✅ Supabase project with storage bucket
- ✅ OpenAI API account with Whisper access
- ✅ Backend running and accessible from mobile device
- ✅ Network connectivity between mobile and backend

## Next Steps

Consider implementing:

- [ ] Offline queue for failed uploads
- [ ] Audio compression before upload
- [ ] Speaker identification in transcripts
- [ ] Custom vocabulary for medical terms
- [ ] Export functionality for transcripts

## Support

For issues or questions:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple audio file first
4. Ensure network connectivity between mobile and backend

---

_Audio recording and transcription system ready for medical documentation workflows._
