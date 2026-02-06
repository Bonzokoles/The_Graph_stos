# 🖥️ JIMBO AI Chat - Aplikacja Desktopowa (Electron)

## 📦 O Aplikacji

**JIMBO AI Chat** to teraz pełnoprawna aplikacja desktopowa dla Windows, która łączy:
- ✅ **Frontend** - Astro + React (static build)
- ✅ **Backend** - FastAPI + Python (automatyczny start)
- ✅ **Model AI** - Lokalny model (offline)
- ✅ **MCP Tools** - 9 narzędzi zintegrowanych
- ✅ **Instalator Windows** - NSIS installer + portable exe

### Dlaczego Desktop?

1. **Lepsze połączenie z lokalnym modelem AI** - bezpośredni dostęp do GPU/CPU
2. **Dostęp do systemu plików** - pełna integracja z plikami użytkownika
3. **Offline first** - działa bez internetu
4. **Prywatność** - wszystko lokalnie, żadne dane nie wychodzą
5. **Szybkość** - brak opóźnień sieciowych

---

## 🚀 Instalacja

### Wymagania

- **Node.js 18+** - https://nodejs.org/
- **Python 3.10+** - https://www.python.org/
- **Git** (opcjonalnie)

### Krok 1: Sklonuj/Pobierz Projekt

```powershell
git clone https://github.com/Bonzokoles/bonzo-ai-chat.git
cd bonzo-ai-chat
```

### Krok 2: Zainstaluj Frontend Dependencies

```powershell
npm install
```

### Krok 3: Zainstaluj Backend Dependencies

```powershell
cd Chatbotlocal/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### Krok 4: Pobierz Model AI

Skopiuj model do `Chatbotlocal/backend/models/`:

```powershell
# Przykład: model z HuggingFace
mkdir Chatbotlocal\backend\models
# Skopiuj .bin lub .safetensors files tutaj
```

Lub edytuj `Chatbotlocal/backend/app/model.py` żeby użyć modelu online:

```python
# Zmień w model.py:
model_name = "facebook/opt-350m"  # Lżejszy model dla testów
```

---

## 🎯 Uruchomienie

### Development Mode (Hot Reload)

Terminal 1 - Frontend:
```powershell
npm run dev
```

Terminal 2 - Backend (Python venv):
```powershell
cd Chatbotlocal\backend
venv\Scripts\activate
python app/main.py
```

Terminal 3 - Electron:
```powershell
npm run electron:start
```

**Lub wszystko naraz**:
```powershell
npm run electron:dev
```

Aplikacja otworzy się w oknie desktopowym.

---

## 📦 Build - Instalator Windows

### Build Static Frontend

```powershell
npm run build:static
```

Wynik: `dist/` folder ze statycznymi plikami HTML/CSS/JS

### Build Electron App (EXE + Installer)

```powershell
npm run electron:build
```

**Lub pełny build**:
```powershell
npm run dist
```

### Pliki Wyjściowe

Po buildzie znajdziesz w `release/`:

- **JIMBO AI Chat Setup 2.0.0.exe** - Instalator NSIS
- **JIMBO AI Chat 2.0.0.exe** - Portable (bez instalacji)
- **win-unpacked/** - Nieopakowana aplikacja

### Instalacja z .exe

1. Uruchom **JIMBO AI Chat Setup 2.0.0.exe**
2. Wybierz folder instalacji (domyślnie: `C:\Program Files\JIMBO AI Chat`)
3. Kliknij Install
4. ✅ Gotowe! Ikona na pulpicie + start menu

---

## 🔧 Konfiguracja

### Backend Port

Domyślnie: `http://localhost:8000`

Zmień w `electron/main.js`:
```javascript
const BACKEND_PORT = 8000; // Zmień na inny port
```

### Frontend Port (Dev Mode)

Domyślnie: `http://localhost:4322`

Zmień w `electron/main.js`:
```javascript
const FRONTEND_PORT = isDev ? 4322 : null;
```

### Model AI

Edytuj `Chatbotlocal/backend/app/model.py`:

```python
class LocalModel:
    def __init__(self):
        self.model_name = "your-model-name-here"
        # Zmień ścieżkę lub model
```

---

## 🛠️ Struktura Projektu

```
CHATboxJIMBO/
├── electron/                    # Electron main process
│   ├── main.js                  # Main window + backend auto-start
│   ├── preload.js               # Security preload script
│   └── resources/               # Ikony, assets
│       └── icon.ico             # Ikona Windows
│
├── dist/                        # Static build (Astro)
│   └── index.html               # Built frontend
│
├── Chatbotlocal/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py          # FastAPI server
│   │   │   ├── model.py         # AI model loader
│   │   │   ├── mcp_tools.py     # MCP tools (9 tools)
│   │   │   └── db.py            # SQLite database
│   │   ├── venv/                # Python virtual environment
│   │   └── requirements.txt
│   │
│   └── src/
│       └── components/
│           └── ChatWidgetJimbo.jsx  # React chat UI
│
├── package.json                 # Electron + Astro config
├── astro.config.mjs             # Static build (no SSR)
└── README.md
```

---

## 🐛 Troubleshooting

### Backend nie startuje

1. Sprawdź czy Python venv istnieje:
   ```powershell
   cd Chatbotlocal\backend
   venv\Scripts\activate
   python --version  # Powinno być 3.10+
   ```

2. Sprawdź logi w konsoli Electrona (F12)

3. Uruchom backend manualnie:
   ```powershell
   cd Chatbotlocal\backend
   venv\Scripts\activate
   python app/main.py
   ```

### Electron nie znajduje modułów

Przeinstaluj dependencies:
```powershell
rm -Recurse -Force node_modules
npm install
```

### Build fails

Sprawdź czy `dist/` folder istnieje:
```powershell
npm run build:static
dir dist  # Powinno być index.html
```

### Model AI nie ładuje się

Sprawdź `Chatbotlocal/backend/app/model.py`:
- Czy ścieżka do modelu jest poprawna?
- Czy model jest pobrany?
- Czy masz wystarczająco RAM/GPU?

---

## 📊 Porównanie: Web vs Desktop

| Feature                  | Web (Cloudflare) | Desktop (Electron) |
|--------------------------|------------------|--------------------|
| **Instalacja**           | 0 - tylko URL    | Instalator .exe    |
| **Model AI**             | API online       | Lokalny model      |
| **Prywatność**           | Dane w chmurze   | 100% lokalnie      |
| **Dostęp do plików**     | Ograniczony      | Pełny              |
| **GPU**                  | Nie              | Tak (lokalny)      |
| **Offline**              | Nie              | Tak                |
| **Auto-update**          | Automatyczny     | Przez installer    |
| **Cross-platform**       | Tak (browser)    | Windows (+ Mac/Linux możliwe) |

---

## 🚀 Deployment

### Dla użytkowników końcowych

1. **Wypuść release na GitHub**:
   - Zbuduj: `npm run dist`
   - Upload `release/*.exe` do GitHub Releases
   - Użytkownicy pobierają installer

2. **Auto-update** (opcjonalne):
   - Dodaj `electron-updater` do `package.json`
   - Konfiguruj w `main.js`:
     ```javascript
     const { autoUpdater } = require('electron-updater');
     autoUpdater.checkForUpdatesAndNotify();
     ```

### Cloudflare (web version)

Jeśli chcesz też wersję web:

1. Zmień `astro.config.mjs` na `output: 'server'`
2. Dodaj adapter: `@astrojs/cloudflare`
3. Deploy: `npm run wrangler:deploy`

---

## 🔐 Security

### Electron Security Checklist

✅ **Context isolation** - włączone (`contextIsolation: true`)  
✅ **Node integration** - wyłączone (`nodeIntegration: false`)  
✅ **Sandbox** - włączony (`sandbox: true`)  
✅ **Preload script** - używany do bezpiecznego IPC  
✅ **CSP** - Content Security Policy w HTML  

### Backend Security

✅ **CORS** - Ograniczony do `localhost`  
✅ **MCP tools** - Sandboxed execution  
✅ **File upload** - Tylko do `mcp_workspace/`  
✅ **No eval()** - Bezpieczny calculator  

---

## 📚 Dokumentacja

- **Electron**: https://www.electronjs.org/docs/latest/
- **Astro**: https://astro.build/
- **FastAPI**: https://fastapi.tiangolo.com/
- **electron-builder**: https://www.electron.build/

---

## 🎉 Co dalej?

- ✅ Aplikacja działa lokalnie
- 🔜 Dodaj więcej MCP tools
- 🔜 Integracja z innymi modelami (GPT-4, Claude)
- 🔜 Export/Import konwersacji
- 🔜 Auto-update dla użytkowników
- 🔜 Mac/Linux builds

---

**Autor**: Bonzokoles  
**Licencja**: MIT  
**GitHub**: https://github.com/Bonzokoles/bonzo-ai-chat
