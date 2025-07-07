# System Architecture Overview

## 🧭 Overall

The app is divided into 4 major layers:

| Layer        | Technologies                   | Description                                                                    |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------ |
| Frontend Web | React + Vite + Tailwind        | Doctor dashboard for managing patients, viewing files, approving AI actions.   |
| Mobile App   | Expo (React Native) + Router   | Quick notifications & simple approval interface on phone, with audio recorder. |
| Backend API  | FastAPI (Python) + Uvicorn     | Handles transcription, GPT summaries, patient DB, WhatsApp integration.        |
| Database     | Supabase (Postgres + pgvector) | Stores structured patient data, file links, embeddings for smart search.       |

## 🔗 External APIs

- OpenAI Whisper (transcription)
- OpenAI GPT-4 (summaries & replies)
- Google Vision API (OCR)
- Twilio WhatsApp Business API
- Google Calendar API

## 🔐 Security

- All patient data encrypted in DB + at rest.
- Only Dr. [Dad's Name] account can access patient files.
- Uses Supabase Auth with RLS (row-level security).

## 🚀 DevOps

- Supabase hosts DB & auth.
- Railway or Render hosts FastAPI.
- Vercel hosts frontend.
 