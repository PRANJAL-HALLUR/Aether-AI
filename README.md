# Aether AI — Intelligent Conversational Copilot

A modern, enterprise-grade AI chatbot web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **FastAPI** with asynchronous **Server-Sent Events (SSE)** token streaming, conversation persistence via **SQLite / SQLAlchemy**, and a reserved layout slot ready for a 2D/3D interactive avatar and voice.

---

## 🌟 Key Features

- **Real-time SSE Streaming**: High-throughput token-by-token streaming from FastAPI to Next.js using native Server-Sent Events.
- **Provider Agnostic (Mock, OpenAI, Anthropic)**: Runs out-of-the-box with **zero API keys** via the built-in realistic `mock` provider, and switches to `openai` or `anthropic` with a single environment variable.
- **Conversation Persistence**: Full conversation history stored in SQLite (async SQLAlchemy ORM), with chronological grouping (Today, Yesterday, Previous 7 Days, Older).
- **Reserved Avatar & Voice Slot**: Dedicated responsive right panel with an animated gradient orb, pulsating aura, and audio-reactive soundwave visualizer — engineered as a drop-in slot for WebGL/Three.js 3D canvas and WebRTC voice.
- **Rich Chat Experience**:
  - Markdown rendering with GitHub-flavored markdown (GFM), lists, and responsive tables.
  - Formatted code blocks with language tags and instant 1-click **Copy Code** button.
  - Streaming thinking indicator and live typing cursor.
  - **Stop Generating** client-side abort controller.
  - Copy message, regenerate response, and thumbs up/down rating actions.
  - Auto-growing input box (Enter to send, Shift+Enter for newline) and mic placeholder.
  - Smooth auto-scroll with floating "Jump to latest" button.
- **Design System & Aesthetics**:
  - ChatGPT / Linear / Vercel inspired glassmorphism aesthetic with subtle borders, rounded-2xl geometry, and glowing accents.
  - Full Dark and Light theme support with seamless transitions and saved preferences.
  - Micro-interactions with Framer Motion (respects `prefers-reduced-motion`).
  - Accessibility: WCAG AA contrast, visible focus rings, keyboard shortcuts (`Ctrl+K` for new chat, `Esc` to close modals), and ARIA landmark roles.

---

## 🏗️ Architecture & Project Structure

```
chatbot/
├── backend/
│   ├── .env.example            # Environment template for backend
│   ├── .env                    # Active backend environment variables
│   ├── requirements.txt        # Python backend dependencies
│   ├── main.py                 # FastAPI application, CORS, rate limits, lifespan
│   ├── config.py               # Pydantic BaseSettings and env config
│   ├── database.py             # Async SQLAlchemy engine & session factory
│   ├── prompts/
│   │   └── system_prompt.md    # Configurable bot personality instructions
│   ├── models/                 # SQLAlchemy ORM models (Conversation, Message)
│   ├── schemas/                # Pydantic validation schemas (ChatRequest, etc.)
│   ├── llm/                    # Provider abstraction (Mock, OpenAI, Anthropic)
│   ├── services/               # Chat orchestration and SSE generator
│   ├── routers/                # API route handlers (chat, conversations, health)
│   └── tests/                  # Pytest test suite for chat endpoints
├── frontend/
│   ├── .env.example            # Environment template for Next.js
│   ├── .env.local              # Local Next.js environment configuration
│   ├── app/                    # Next.js App Router (layout.tsx, globals.css, page.tsx)
│   ├── components/             # Reusable UI components
│   │   ├── header/TopBar.tsx   # Header bar, logo, status badge, theme switch
│   │   ├── sidebar/Sidebar.tsx # Collapsible conversation list, search, delete
│   │   ├── chat/               # Chat area, message bubbles, code blocks, input
│   │   ├── avatar/AvatarPanel.tsx # Reserved slot for 3D/2D avatar & voice visualizer
│   │   └── modals/SettingsModal.tsx # Preferences and shortcuts modal
│   ├── hooks/useChat.ts        # Modular chat & SSE streaming custom hook
│   ├── lib/                    # Typed API client and utility helpers
│   └── types/                  # Strict TypeScript interfaces
├── package.json                # Root scripts to orchestrate both servers
└── README.md                   # Complete documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10, 3.11, 3.12, or 3.13

### 1. Installation
Clone the repository and install root and subproject dependencies:

```bash
# 1. Install root dependencies (concurrent runner)
npm install

# 2. Setup backend virtual environment and dependencies
# On Windows PowerShell:
npm run setup:backend

# 3. Setup frontend dependencies
npm run setup:frontend
```

*(Alternatively, run `cd backend && python -m venv venv && .\venv\Scripts\pip install -r requirements.txt` and `cd ../frontend && npm install`)*

---

### 2. Run Both Servers With One Command

Run both FastAPI (port `8000`) and Next.js (port `3000`) simultaneously:

```bash
npm run dev
```

- **Frontend App**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend API & Swagger Docs**: Available at [http://localhost:8000/docs](http://localhost:8000/docs).
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health).

---

## 🧪 Running Tests

The test suite runs against the async FastAPI endpoints using the built-in mock streaming provider:

```bash
npm run test:backend
```

---

## 🔄 Switching from Mock to a Real LLM

By default, `LLM_PROVIDER=mock`, allowing full offline execution without API keys.

To switch to a live AI model:
1. Open `backend/.env`.
2. Update `LLM_PROVIDER` and paste your API key:

### For OpenAI:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

### For Anthropic Claude:
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

3. Restart the backend or run `npm run dev`. Your chat messages will now stream live responses directly from your chosen LLM provider.

---

## 🎭 How to Add the Talking Avatar & Voice

The architecture was intentionally planned to make multimodal expansion plug-and-play:

### 1. Frontend Integration Slot
- In [`frontend/components/avatar/AvatarPanel.tsx`](frontend/components/avatar/AvatarPanel.tsx), replace the `<div className="animate-orb">` block with your 3D canvas (e.g. `@react-three/fiber` or Babylon.js) or a `<video>` element for a WebRTC stream.
- The `useChat` hook exposes an `onTokenChunk` callback:
  ```typescript
  const { messages, isStreaming } = useChat({
    onTokenChunk: (token) => {
      // 1. Feed token into text-to-speech audio stream (ElevenLabs, Cartesia, or OpenAI TTS)
      // 2. Drive mouth viseme blendshapes in your 3D avatar
    },
    onStreamComplete: (finalMessage) => {
      // Return avatar to idle breathing animation
    }
  });
  ```

### 2. Speech-to-Text (Microphone)
- In [`frontend/components/chat/ChatInput.tsx`](frontend/components/chat/ChatInput.tsx), connect the existing mic button to Web Audio API / MediaRecorder or a streaming STT service (e.g., Deepgram, Whisper).
- When transcription is finalized, invoke `sendMessage(transcript)`.

---

## 🛡️ Security & Best Practices

- **Zero API Key Leakage**: LLM API keys are exclusively loaded and consumed in the Python FastAPI backend. Next.js never sees private keys.
- **Input Validation**: All incoming requests pass strict Pydantic model validation (`ChatRequest`, message length limits, non-empty checks).
- **Rate Limiting**: Configured via `slowapi` (`60 requests/minute`) to prevent abuse and DDoS.
- **CORS Restricted**: Backend CORS policy is configurable via `CORS_ORIGINS` in `backend/.env`.
