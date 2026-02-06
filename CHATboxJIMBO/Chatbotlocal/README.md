# 🤖 MyBonzo AI Chat - Lokalny Chatbot z MCP

**Frontend**: Astro + React | **Backend**: FastAPI + PyTorch + MCP Tools

✨ **Pełna integracja Model Context Protocol (MCP)** - lokalny model AI z dostępem do narzędzi!

## 🌟 Nowe funkcje (MCP Integration)

- 🔧 **9 gotowych narzędzi MCP**: file ops, web search, calculator, code execution i więcej
- 🔒 **Bezpieczne sandboxing**: izolowane wykonywanie z timeoutami
- 🌐 **Environment-based config**: łatwa konfiguracja przez .env
- ✅ **Connection monitoring**: real-time status połączenia front-back
- 📊 **Tool calls visualization**: wyświetlanie użytych narzędzi w UI
- 🎨 **Rozszerzalne**: łatwe dodawanie własnych narzędzi

👉 **[Pełna dokumentacja MCP Integration Guide →](./MCP_INTEGRATION_GUIDE.md)**

## 🚀 Szybki start

### Backend (FastAPI + PyTorch + MCP)

1. **Przygotuj serwer z GPU** (opcjonalne, można też CPU):
   ```bash
   # Sterowniki NVIDIA + CUDA
   # PyTorch dla CUDA 11.8:
   pip install torch --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Zainstaluj zależności**:
   ```bash
   cd Chatbotlocal/backend
   pip install -r requirements.txt
   ```

3. **Konfiguracja**:
   ```bash
   cp .env.example .env
   nano .env  # Ustaw ALLOWED_ORIGINS, MCP_SAFE_DIR, etc.
   ```

4. **Umieść model** w `./models/`:
   - Z HuggingFace lokalnie lub własny model

5. **Uruchom backend**:
   ```bash
   cd app
   python main.py
   # Lub Docker:
   docker compose up --build
   ```

   Backend na: `http://localhost:8000`

### Frontend (Astro + React)

1. **Konfiguruj environment**:
   ```bash
   # W głównym katalogu projektu
   cp .dev.vars.example .dev.vars
   nano .dev.vars  # Ustaw PUBLIC_BACKEND_URL
   ```

2. **Instaluj i uruchom**:
   ```bash
   npm install
   npm run dev
   ```

   Frontend na: `http://localhost:4321`

3. **Deployment**:
   - **Frontend**: Cloudflare Pages (automatyczny deploy z repo)
   - **Backend**: VPS z GPU lub prywatny serwer

## 🔧 Dostępne narzędzia MCP

| Narzędzie | Opis | Przykład użycia |
|-----------|------|-----------------|
| 📄 `read_file` | Czyta pliki | `[TOOL:read_file]data.txt[/TOOL]` |
| ✏️ `write_file` | Zapisuje pliki | `[TOOL:write_file]note.txt\|Hello[/TOOL]` |
| 📁 `list_directory` | Lista plików | `[TOOL:list_directory]./data[/TOOL]` |
| 🔍 `web_search` | Szuka w necie | `[TOOL:web_search]Python tutorial[/TOOL]` |
| 🔢 `calculator` | Obliczenia mat. | `[TOOL:calculator]sqrt(16)+5[/TOOL]` |
| 🐍 `execute_python` | Uruchamia kod | `[TOOL:execute_python]print("Hi")[/TOOL]` |
| 💻 `system_info` | Info o systemie | `[TOOL:system_info][/TOOL]` |
| 🕐 `get_datetime` | Data i czas | `[TOOL:get_datetime][/TOOL]` |
| 📊 `count_words` | Statystyki tekstu | `[TOOL:count_words]Test text[/TOOL]` |

**Więcej**: Zobacz [MCP_INTEGRATION_GUIDE.md](./MCP_INTEGRATION_GUIDE.md)

## ⚡ Optymalizacje pamięci i wydajności

- ✅ Model z `low_cpu_mem_usage=True`
- ✅ FP16 (`torch.float16`) dla GPU
- 🔄 Quantization (bitsandbytes/llama.cpp) dla mniejszej VRAM
- 🔄 Streaming responses (SSE) - w planach
- ✅ Limit `max_new_tokens` i czyszczenie kontekstu
- ✅ Connection pooling i CORS optimization

Deployment z Cloudflare:
- Frontend: Cloudflare Pages (statyczne)
- Backend: nie hostuj modelu na Cloudflare Workers (nie nadają się do ciężkich modeli).
  - Użyj Cloudflare Tunnel (cloudflared) aby bezpiecznie udostępnić backend na publiczny adres lub użyj Cloudflare Access do zabezpieczenia endpointu.
  - Alternatywnie: Cloudflare Workers jako proxy do twojego backendu i dodaj rate-limiting / auth.

Bezpieczeństwo:
- Zabezpiecz endpoint (tokeny, Cloudflare Access).
- Ogranicz zapytania per IP.
- Sanitizuj inputy jeśli model używany w produktach.

Przykładowe open-source komponenty z GitHub do rozważenia:
- https://github.com/botfront/rasa-webchat (self-hostable web widget)
- https://github.com/mckaywrigley/chatbot-ui (UI, często self-hostable)
- https://github.com/oobabooga/text-generation-webui (pełne web UI do lokalnego hostingu modeli)
- https://github.com/botpress/botpress (pełna platforma BOT, self-hosted)

Uwaga: powyższe repozytoria są przykładami — nie używają zewnętrznych kluczy, ale wymagają własnego hostingu modelu/serwera.