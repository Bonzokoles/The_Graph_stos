# 🛠️ MCP Integration Guide - MyBonzo AI Chat

## Kompletny przewodnik po integracji Model Context Protocol (MCP)

---

## 📋 Spis treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura MCP](#architektura-mcp)
3. [Dostępne narzędzia](#dostępne-narzędzia)
4. [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
5. [Przykłady użycia](#przykłady-użycia)
6. [API Reference](#api-reference)
7. [Bezpieczeństwo](#bezpieczeństwo)
8. [Rozszerzanie funkcjonalności](#rozszerzanie-funkcjonalności)

---

## 🎯 Wprowadzenie

**MyBonzo AI Chat** został rozszerzony o pełną integrację **Model Context Protocol (MCP)**, która umożliwia lokalnemu modelowi AI dostęp do zewnętrznych narzędzi i funkcji.

### Co to jest MCP?

MCP (Model Context Protocol) to protokół umożliwiający modelom AI interakcję z:
- Systemem plików
- Internetem (wyszukiwanie)
- Kalkulatorem matematycznym
- Wykonywaniem kodu
- Informacjami systemowymi
- I wieloma innymi!

### Kluczowe cechy

✅ **Bezpieczne** - Sandboxowane wykonywanie z limitami
✅ **Rozszerzalne** - Łatwe dodawanie własnych narzędzi
✅ **Konfigurowalne** - Szczegółowa kontrola nad funkcjonalnością
✅ **Lokalne** - Wszystko działa na twoim serwerze bez zewnętrznych API

---

## 🏗️ Architektura MCP

```
┌─────────────────────────────────────────┐
│         FRONTEND (React/Astro)          │
│  - ChatWidget z obsługą tool_calls      │
│  - Wizualizacja użytych narzędzi        │
│  - Connection status indicator          │
└────────────────┬────────────────────────┘
                 │
            HTTP POST /api/chat
            {messages, use_tools: true}
                 │
┌────────────────▼────────────────────────┐
│      BACKEND (FastAPI + PyTorch)        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   main.py - API Endpoints       │   │
│  │   - /api/chat (with MCP)        │   │
│  │   - /api/tools (list)           │   │
│  │   - /api/health                 │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  mcp_tools.py - Tool Registry   │   │
│  │  ┌──────────────────────────┐   │   │
│  │  │ MCPToolRegistry          │   │   │
│  │  │ - register_tool()        │   │   │
│  │  │ - execute_tool()         │   │   │
│  │  │ - parse_tool_call()      │   │   │
│  │  └──────────────────────────┘   │   │
│  │                                  │   │
│  │  Narzędzia:                      │   │
│  │  📄 read_file                    │   │
│  │  ✏️ write_file                   │   │
│  │  📁 list_directory               │   │
│  │  🔍 web_search                   │   │
│  │  🔢 calculator                   │   │
│  │  🐍 execute_python               │   │
│  │  💻 system_info                  │   │
│  │  🕐 get_datetime                 │   │
│  │  📊 count_words                  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   model.py - AI Model           │   │
│  │   - HuggingFace Transformers    │   │
│  │   - PyTorch Inference           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Przepływ wywołania narzędzia

1. **User**: "Policz 2+2"
2. **Frontend** → Backend: `POST /api/chat` z wiadomością
3. **Backend**: Generuje odpowiedź modelu z instrukcją MCP
4. **Model**: Generuje `[TOOL:calculator]2+2[/TOOL]`
5. **Parser**: Wykrywa wywołanie narzędzia
6. **Registry**: Wykonuje `calculator(expression="2+2")`
7. **Tool**: Zwraca `"🔢 2+2 = 4"`
8. **Backend** → Frontend: Odpowiedź + `tool_calls` array
9. **Frontend**: Wyświetla wynik i użyte narzędzia

---

## 🔧 Dostępne narzędzia

### 1. **read_file** - Czytanie plików

**Opis**: Czyta zawartość pliku tekstowego

**Parametry**:
- `path` (str) - Ścieżka do pliku

**Przykład**:
```
[TOOL:read_file]./data/example.txt[/TOOL]
```

**Bezpieczeństwo**:
- Tylko dozwolone rozszerzenia (.txt, .json, .csv, .md, .py, .js)
- Maksymalny rozmiar: 10MB
- Sandbox directory: `./mcp_workspace`

---

### 2. **write_file** - Zapisywanie plików

**Opis**: Zapisuje tekst do pliku

**Parametry**:
- `path` (str) - Nazwa pliku
- `content` (str) - Zawartość do zapisania

**Przykład**:
```
[TOOL:write_file]note.txt|Hello World![/TOOL]
```

**Bezpieczeństwo**:
- Tylko w katalogu `./mcp_workspace`
- Automatyczna sanityzacja nazw plików

---

### 3. **list_directory** - Listowanie katalogów

**Opis**: Wyświetla zawartość katalogu

**Parametry**:
- `path` (str, default=".") - Ścieżka katalogu

**Przykład**:
```
[TOOL:list_directory]./data[/TOOL]
```

**Zwraca**:
```
📂 Zawartość './data':
📁 folder1
📄 file1.txt
📄 file2.json
```

---

### 4. **web_search** - Wyszukiwanie w internecie

**Opis**: Wyszukuje informacje używając DuckDuckGo API

**Parametry**:
- `query` (str) - Zapytanie wyszukiwania

**Przykład**:
```
[TOOL:web_search]Python programming language[/TOOL]
```

**API**: DuckDuckGo Instant Answer API (bez klucza!)

---

### 5. **calculator** - Kalkulator matematyczny

**Opis**: Wykonuje obliczenia matematyczne

**Parametry**:
- `expression` (str) - Wyrażenie matematyczne

**Przykład**:
```
[TOOL:calculator]sqrt(16) + 2^3[/TOOL]
```

**Funkcje**:
- Podstawowe: `+`, `-`, `*`, `/`, `^` (potęga)
- Zaawansowane: `sin()`, `cos()`, `tan()`, `sqrt()`, `log()`, `abs()`, `pow()`
- Stałe: `pi`, `e`

**Zwraca**:
```
🔢 sqrt(16) + 2**3 = 12.0
```

---

### 6. **execute_python** - Wykonywanie kodu Python

**Opis**: Wykonuje kod Python w sandboxie

**Parametry**:
- `code` (str) - Kod Python do wykonania

**Przykład**:
```
[TOOL:execute_python]print("Hello from Python!")[/TOOL]
```

**Bezpieczeństwo**:
- Timeout: 5 sekund
- Blokowane importy: `os`, `sys`, `subprocess`, `socket`
- Blokowane słowa: `exec`, `eval`, `__`
- Subprocess isolation

**Zwraca**:
```
🐍 Wynik:
Hello from Python!
```

---

### 7. **system_info** - Informacje systemowe

**Opis**: Zwraca podstawowe informacje o systemie

**Parametry**: Brak

**Przykład**:
```
[TOOL:system_info][/TOOL]
```

**Zwraca**:
```
💻 Informacje systemowe:
- System: Linux
- Release: 5.15.0
- Machine: x86_64
- Processor: Intel Core i7
- Python: 3.10.12
```

---

### 8. **get_datetime** - Aktualna data/czas

**Opis**: Zwraca aktualną datę i czas

**Parametry**: Brak

**Przykład**:
```
[TOOL:get_datetime][/TOOL]
```

**Zwraca**:
```
🕐 2024-01-15 14:30:45 (Monday)
```

---

### 9. **count_words** - Statystyki tekstu

**Opis**: Liczy słowa, znaki i linie w tekście

**Parametry**:
- `text` (str) - Tekst do analizy

**Przykład**:
```
[TOOL:count_words]Hello world! This is a test.[/TOOL]
```

**Zwraca**:
```
📊 Statystyki tekstu:
- Słowa: 6
- Znaki: 30
- Linie: 1
```

---

## 🚀 Instalacja i konfiguracja

### Krok 1: Instalacja zależności

```bash
cd Chatbotlocal/backend
pip install -r requirements.txt
```

**requirements.txt** zawiera:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `transformers` - HuggingFace models
- `torch` - PyTorch dla AI
- `sqlalchemy` - Database ORM
- `pydantic` - Data validation
- `requests` - HTTP client dla web search
- `python-dotenv` - Environment variables

### Krok 2: Konfiguracja environment

Skopiuj i edytuj `.env`:

```bash
cp .env.example .env
nano .env
```

**Kluczowe ustawienia**:

```env
# CORS - dozwolone origins
ALLOWED_ORIGINS=*  # Dev: *, Prod: https://twoja-domena.com

# MCP Tools
MCP_SAFE_DIR=./mcp_workspace
MCP_WEB_SEARCH_ENABLED=true
MCP_CODE_EXECUTION_ENABLED=true

# Database
DATABASE_URL=sqlite:///./chat.db

# Model
MODEL_PATH=models/your-model-folder
```

### Krok 3: Uruchomienie backendu

```bash
cd Chatbotlocal/backend/app
python main.py
```

Backend uruchomi się na `http://0.0.0.0:8000`

### Krok 4: Konfiguracja frontendu

Edytuj `.dev.vars` w głównym katalogu:

```env
PUBLIC_BACKEND_URL=http://localhost:8000/api
```

### Krok 5: Uruchomienie frontendu

```bash
npm run dev
```

Frontend dostępny na `http://localhost:4321`

---

## 💡 Przykłady użycia

### Przykład 1: Kalkulator

**User**: "Policz pierwiastek z 144 plus 20"

**Model**: Użyję kalkulatora [TOOL:calculator]sqrt(144) + 20[/TOOL]

**Wynik**:
```
🔧 Użyte narzędzia:
- calculator: 🔢 sqrt(144) + 20 = 32.0

Pierwiastek z 144 to 12, więc 12 + 20 = 32
```

---

### Przykład 2: Wyszukiwanie

**User**: "Znajdź informacje o Pythonie"

**Model**: Poszukam informacji [TOOL:web_search]Python programming language[/TOOL]

**Wynik**:
```
🔧 Użyte narzędzia:
- web_search: 🔍 Wynik dla 'Python programming language':
  Python is a high-level, general-purpose programming language...

Python to wysokopoziomowy język programowania...
```

---

### Przykład 3: Operacje na plikach

**User**: "Zapisz 'Hello World' do pliku test.txt"

**Model**: Zapiszę to do pliku [TOOL:write_file]test.txt|Hello World[/TOOL]

**Wynik**:
```
🔧 Użyte narzędzia:
- write_file: ✅ Zapisano 11 znaków do './mcp_workspace/test.txt'

Zapisałem tekst do pliku!
```

---

### Przykład 4: Wykonanie kodu Python

**User**: "Napisz program który liczy silnię z 5"

**Model**: [TOOL:execute_python]
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

print(f"5! = {factorial(5)}")
[/TOOL]

**Wynik**:
```
🔧 Użyte narzędzia:
- execute_python: 🐍 Wynik:
  5! = 120

Silnia z 5 wynosi 120
```

---

## 📚 API Reference

### Endpoints

#### `GET /api/health`

**Sprawdza status backendu**

**Response**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "database": "connected",
  "mcp_tools": 9,
  "available_tools": [
    "read_file", "write_file", "list_directory",
    "web_search", "calculator", "execute_python",
    "system_info", "get_datetime", "count_words"
  ]
}
```

---

#### `GET /api/tools`

**Lista dostępnych narzędzi MCP**

**Response**:
```json
{
  "tools": [
    {
      "name": "calculator",
      "description": "Wykonuje obliczenia matematyczne. Args: expression (str)"
    },
    {
      "name": "web_search",
      "description": "Wyszukuje informacje w internecie. Args: query (str)"
    }
    // ... więcej narzędzi
  ]
}
```

---

#### `POST /api/chat`

**Główny endpoint czatu z obsługą MCP**

**Request**:
```json
{
  "messages": [
    {"role": "user", "text": "Policz 2+2"}
  ],
  "max_tokens": 512,
  "use_tools": true
}
```

**Response**:
```json
{
  "text": "Użyję kalkulatora [TOOL:calculator]2+2[/TOOL]\n\n🔧 Użyte narzędzia:\n- calculator: 🔢 2+2 = 4",
  "tool_calls": [
    {
      "tool": "calculator",
      "args": {"expression": "2+2"},
      "result": "🔢 2+2 = 4"
    }
  ]
}
```

---

## 🔒 Bezpieczeństwo

### Sandboxing

**Operacje na plikach**:
- Tylko w `./mcp_workspace` directory
- Maksymalny rozmiar pliku: 10MB
- Dozwolone rozszerzenia: `.txt`, `.json`, `.csv`, `.md`, `.py`, `.js`

**Wykonywanie kodu**:
- Subprocess isolation
- Timeout: 5 sekund
- Blokowane importy: `os`, `sys`, `subprocess`, `socket`
- Blokowane keywords: `exec`, `eval`, `__import__`

**Web search**:
- Timeout: 5 sekund
- Rate limiting: 60 req/min (konfigurowalny)
- Tylko DuckDuckGo API (bez uwierzytelniania)

### CORS

**Development**:
```env
ALLOWED_ORIGINS=*
```

**Production**:
```env
ALLOWED_ORIGINS=https://twoja-strona.pages.dev,https://twoja-domena.com
```

### Rate Limiting

W `mcp_config.json`:
```json
{
  "security": {
    "rate_limiting": {
      "enabled": true,
      "max_requests_per_minute": 60
    }
  }
}
```

---

## 🎨 Rozszerzanie funkcjonalności

### Dodawanie własnego narzędzia

**Krok 1**: Edytuj `mcp_tools.py`

```python
class MCPToolRegistry:
    def _register_default_tools(self):
        # ... existing tools ...

        # Twoje nowe narzędzie
        self.register_tool(
            name="translate",
            description="Tłumaczy tekst. Args: text (str), to_lang (str)",
            function=self._translate
        )

    def _translate(self, text: str, to_lang: str) -> str:
        """Tłumaczenie tekstu"""
        try:
            # Implementacja (np. używając API DeepL/Google)
            result = my_translation_api(text, to_lang)
            return f"🌐 Tłumaczenie: {result}"
        except Exception as e:
            return f"❌ Błąd tłumaczenia: {str(e)}"
```

**Krok 2**: Restart backendu

```bash
python main.py
```

**Krok 3**: Test

Użyj w czacie:
```
[TOOL:translate]Hello World|pl[/TOOL]
```

---

### Modyfikacja istniejącego narzędzia

**Przykład**: Rozszerzenie kalkulatora o więcej funkcji

```python
def _calculator(self, expression: str) -> str:
    # Dodaj nowe funkcje
    result = eval(expression, {"__builtins__": {}}, {
        # Existing
        "sin": math.sin,
        "cos": math.cos,
        # NEW
        "factorial": math.factorial,
        "gcd": math.gcd,
        "lcm": lambda a, b: abs(a*b) // math.gcd(a, b)
    })
    return f"🔢 {expression} = {result}"
```

---

## 📊 Monitoring i Debugging

### Logi

Backend wyświetla szczegółowe logi:

```bash
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Tool executed: calculator(expression="2+2") -> "🔢 2+2 = 4"
INFO:     Response generated with 1 tool calls
```

### Health Check

Sprawdź status:

```bash
curl http://localhost:8000/api/health
```

### Lista narzędzi

```bash
curl http://localhost:8000/api/tools
```

---

## 🌟 Zaawansowane użycie

### Łańcuchowe wywołania narzędzi

Model może wywoływać wiele narzędzi:

```
User: "Zapisz dzisiejszą datę do pliku date.txt"

Model:
Najpierw pobiorę datę [TOOL:get_datetime][/TOOL]
A teraz zapiszę [TOOL:write_file]date.txt|2024-01-15 14:30[/TOOL]
```

### Warunkowe wywołania

```
User: "Jeśli 10 > 5, policz 10 * 2"

Model:
Sprawdzam warunek [TOOL:calculator]10 > 5[/TOOL]
Warunek prawdziwy! [TOOL:calculator]10 * 2[/TOOL]
```

---

## 📝 TODO / Roadmap

- [ ] Streaming responses (SSE)
- [ ] Więcej narzędzi (PDF reader, image processing)
- [ ] Fine-tuning prompt dla lepszego tool usage
- [ ] UI panel do włączania/wyłączania narzędzi
- [ ] Persystencja historii tool calls w bazie
- [ ] Webhooks dla custom integrations
- [ ] Docker compose z GPU support

---

## 🤝 Wsparcie

Jeśli masz pytania:
1. Sprawdź dokumentację w `README.md`
2. Zobacz przykłady w `examples/`
3. Otwórz issue na GitHub

---

## 📄 Licencja

MIT License - używaj swobodnie!

---

**Stworzone z ❤️ dla MyBonzo AI Chat**
