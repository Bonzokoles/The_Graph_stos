# 🚀 JIMBO NODE SYSTEM V2 - Visual Workflow Builder

## 📋 Opis
Nowoczesny system budowania workflow oparty na node'ach wizualnych z integracją AI i zaawansowanymi możliwościami przetwarzania danych.

## 🎯 Stack Technologiczny
- **Frontend**: React 19 + Vite + TypeScript
- **Flow Engine**: @xyflow/react (React Flow)
- **State Management**: Zustand + Immer
- **Auto-Layout**: ELK.js
- **Forms**: JSON Forms + AJV
- **Backend**: FastAPI (Python)
- **Databases**: SQLite + ChromaDB
- **i18n**: i18next (Polski/English)

## ✨ Główne Funkcje

### 🎨 Node'y (85+)
- **Input Nodes (15)**: Text Input, File Upload, Web Scraper, API Request, Database Query, RSS Reader, CSV Reader, JSON Parser, Voice Input, Image Input, Video Input, Camera Capture, GitHub Repo, Google Drive, Clipboard
- **AI Nodes (20)**: OpenAI, Anthropic Claude, Google Gemini, Mistral, Cohere, Perplexity, HuggingFace, Ollama, Groq, Together AI, Replicate, DALL-E, Midjourney, Stable Diffusion, Whisper, ElevenLabs, GPT-4 Vision, Claude Vision, Embeddings, Agent Executor
- **Process Nodes (30)**: Text Chunker, ChromaDB, Pinecone, Weaviate, Qdrant, SQLite, PostgreSQL, MongoDB, Redis, Text Transform, Regex Extract, JSON Transform, Filter, Sort, Merge, Split, Conditional, Loop, Delay, Cache, Retry, Error Handler, Validator, Template, Summarize, Translate, Sentiment Analysis, Entity Extraction, Image Resize, PDF Extract
- **Output Nodes (20)**: Webhook, Slack, Discord, Telegram, Email, SMS, WhatsApp, Twitter/X, Notion, Airtable, Google Sheets, File Write, S3 Upload, FTP Upload, Console, Desktop Notification, Logger, Printer, Clipboard, QR Code

### 🛠️ Zaawansowane Funkcje
- ✅ **Custom Node Builder** - Twórz własne node'y wizualnie bez kodowania
- ✅ **12 Gotowych Szablonów** - RAG Pipeline, Document Processing, Multi-Agent, Web Scraping, Image Generation, etc.
- ✅ **Auto-Layout** - Automatyczne układanie grafów (ELK.js)
- ✅ **DAG Validation** - Wykrywanie cykli i walidacja struktury
- ✅ **Export/Import** - JSON, PNG, PDF, Share via URL
- ✅ **Undo/Redo** - Pełna historia zmian
- ✅ **Keyboard Shortcuts** - Ctrl+Z, Ctrl+S, Del, etc.
- ✅ **Dark/Light Theme** - Przełączanie motywów
- ✅ **Multi-language** - Polski/English
- ✅ **Real-time Preview** - Podgląd na żywo
- ✅ **Node Templates** - Biblioteka szablonów węzłów

## 🚀 Instalacja

### Szybka instalacja (Windows)
```batch
git clone https://github.com/Bonzokoles/The_Graph_stos.git
cd The_Graph_stos
scripts\install_and_run.bat
```

### Ręczna instalacja

#### Frontend
```bash
npm install
npm run dev
```

#### Backend (opcjonalny)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## 🌐 Dostęp
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔑 Konfiguracja API Keys

Skopiuj `.env.example` jako `.env` i uzupełnij swoimi kluczami:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GOOGLE_API_KEY=...

# Mistral
MISTRAL_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...

# Cohere
COHERE_API_KEY=...

# Ollama (local)
OLLAMA_URL=http://localhost:11434
```

## 📚 Szablony Workflow

### 1. 🤖 RAG Pipeline
Retrieval-Augmented Generation z ChromaDB
- File Upload → Text Chunker → Embeddings → ChromaDB → AI Model → Output

### 2. 📄 Document Processing
Przetwarzanie dokumentów PDF → Text → Summary → Translate
- File Upload → PDF Extract → Chunker → Summarize → Translate → File Write

### 3. 👥 Multi-Agent System
Współpraca wielu agentów AI
- Input → [OpenAI + Claude + Gemini] → Merge → Synthesizer → Output

### 4. 🌐 Web Scraping + AI
Analiza treści stron internetowych
- URL Input → Web Scraper → Chunker → AI Analysis → Report → Email

### 5. 🎨 Image Generation
DALL-E / Stable Diffusion
- Text Prompt → Enhance → Image Gen → S3 Upload → Notification

### 6. 📊 Sentiment Analysis
Analiza sentymentu mediów społecznościowych
- Twitter API → Sentiment → Filter → Database → Dashboard

### 7. 🎤 Voice Assistant
Voice → Text → AI → Speech
- Voice Input → Whisper → OpenAI → ElevenLabs → Audio Output

### 8. 💻 Code Review Assistant
GitHub → AI Review → Comments
- GitHub Repo → Chunker → Claude → Template → Slack

### 9. 🔄 ETL Pipeline
Extract → Transform → Load
- API → JSON Parse → Transform → Database → Sheets

### 10. 📧 Email Automation
Automatyczne odpowiedzi email
- Email Input → AI Processing → Template → Send Email

### 11. 🤳 Social Media Bot
Automatyczne posty
- RSS → Summarize → AI Enhancement → Twitter Post

### 12. 🔬 Research Assistant
Asystent badawczy
- Query → Web Search → Extract → Summarize → Report

## 🛠️ Rozwój

### Skrypty
```bash
# Development
npm run dev

# Build
npm run build

# Tests
npm run test
npm run test:watch
npm run test:ui

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Type checking
npm run type-check
```

### Struktura Projektu
```
The_Graph_stos/
├── src/
│   ├── components/      # React components
│   ├── nodes/          # Node definitions
│   ├── store/          # Zustand store
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   ├── types/          # TypeScript types
│   └── templates/      # Workflow templates
├── backend/
│   ├── api/            # API routes
│   ├── services/       # Business logic
│   ├── integrations/   # AI providers
│   └── models/         # Data models
├── public/
│   └── locales/        # Translations
├── scripts/            # Build scripts
└── docs/               # Documentation
```

## 🎨 Custom Node Builder

Twórz własne node'y bez kodowania:

1. Otwórz **Custom Node Builder** w pasku narzędzi
2. Zdefiniuj nazwę, ikonę, kategorię
3. Dodaj pola formularza (text, number, select, textarea, etc.)
4. Ustaw liczbę wejść/wyjść
5. Wygeneruj kod lub użyj bezpośrednio

## 🔌 Integracje AI

### Wspierani Dostawcy
- **OpenAI** - GPT-4, GPT-3.5, DALL-E, Whisper
- **Anthropic** - Claude 3 (Opus, Sonnet, Haiku)
- **Google** - Gemini Pro, Gemini Pro Vision
- **Mistral** - Mistral Large, Medium, Small
- **Cohere** - Command R+, Command R
- **Groq** - Llama 3.1, Mixtral
- **Ollama** - Local models (Llama, Mistral, etc.)
- **HuggingFace** - Custom models
- **Replicate** - Various models
- **ElevenLabs** - Text-to-Speech
- **Stability AI** - Stable Diffusion

## 📖 Dokumentacja

- [Installation Guide](./docs/INSTALLATION.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPMENT.md)
- [API Reference](./docs/API_DOCS.md)
- [Node Reference](./docs/NODE_REFERENCE.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

## 📄 Licencja

MIT License - see [LICENSE](./LICENSE) file for details

## 👥 Autorzy

**JIMBO Team** - 2024

## 🙏 Podziękowania

- React Flow team za wspaniałą bibliotekę
- Wszystkim kontrybutorów open-source

---

**Made with ❤️ in Poland** 🇵🇱