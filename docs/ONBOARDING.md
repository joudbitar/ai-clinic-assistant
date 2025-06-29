# 🚀 Developer Onboarding Guide – AI Clinical Assistant

Welcome to the project! This guide will help you set up your full development environment (frontend, mobile, backend) quickly.

---

## 📦 Clone the repository

```bash
git clone git@github.com:YOUR_USERNAME/ai-clinic-assistant.git
cd ai-clinic-assistant
```

---

## 💻 Frontend (Doctor Dashboard)

Runs on **React + Vite + Tailwind**.

```bash
cd frontend
npm install
npm run dev
```

- Opens at: [http://localhost:5173](http://localhost:5173)
- Shows the doctor dashboard with patient cards and approvals.

---

## 📱 Mobile (Expo App)

Runs on **Expo Router (React Native)**.  
Used for recording consultations and receiving notifications.

```bash
cd ../mobile
npm install
npx expo start
```

- Scan the QR code in Expo Go on your phone.
- Navigate to `/record` to test recording audio.

---

## 🐍 Backend (FastAPI)

Handles transcriptions, summaries, patient DB, WhatsApp replies.

```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- Runs at: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger docs at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔐 Environment variables

We use environment variables for all secrets.  
**Never commit your actual `.env` file.** It’s safely ignored by `.gitignore`.

To set up your environment:

```bash
cp .env.example .env
```

Then fill in your real keys inside `.env`:

```
SUPABASE_URL=...
SUPABASE_KEY=...
OPENAI_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
TWILIO_SID=...
TWILIO_AUTH_TOKEN=...
```

✅ This keeps your API keys safe and local.

---

## 📄 Documentation files

| File                  | Purpose                        |
|------------------------|-------------------------------|
| `docs/MVP_SCOPE.md`    | What we’re building & why     |
| `docs/ARCHITECTURE.md` | How the system is structured |
| `docs/ONBOARDING.md`   | This guide                   |

---

## 🚀 That’s it!

Your full development environment is ready to run.

✅ Welcome aboard — let’s build this amazing product together! 🚀
