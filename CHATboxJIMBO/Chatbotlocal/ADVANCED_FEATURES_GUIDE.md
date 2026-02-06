# 🚀 Advanced Features Guide - MyBonzo AI Chat

Kompletny przewodnik po zaawansowanych funkcjach chatbota

---

## 📋 Spis treści

1. [Upload plików](#upload-plików)
2. [Edytor kodu](#edytor-kodu)
3. [Dark/Light Mode](#darklight-mode)
4. [Expandable UI](#expandable-ui)
5. [PWA - Instalacja na Androidzie](#pwa---instalacja-na-androidzie)
6. [Funkcje offline](#funkcje-offline)

---

## 📎 Upload plików

### Funkcjonalność

Chatbot umożliwia wysyłanie plików bezpośrednio w rozmowie!

### Obsługiwane formaty

- **Dokumenty**: `.txt`, `.pdf`, `.doc`, `.docx`, `.md`
- **Dane**: `.json`, `.csv`
- **Obrazy**: `.jpg`, `.jpeg`, `.png`, `.gif`

### Jak używać

1. **Kliknij przycisk "📎 Plik"** w dolnej części chatboxa
2. **Wybierz plik(i)** z dysku (możesz wybrać wiele)
3. **Zobacz podgląd** załączonych plików z nazwą i rozmiarem
4. **Usuń** niepotrzebne pliki klikając ✕
5. **Wyślij** wiadomość z plikami

### Przykład użycia

```
User: *załącza plik data.csv*
      Przeanalizuj te dane

AI: Widzę że załączyłeś plik data.csv (2048 bytes).
    [TOOL:read_file]./mcp_workspace/uploads/data.csv[/TOOL]

    Dane zawierają...
```

### Backend processing

Pliki są zapisywane w:
```
./mcp_workspace/uploads/nazwa-pliku.ext
```

Model AI otrzymuje informację o plikach:
- Nazwa pliku
- Rozmiar w bytes
- Ścieżka do pliku

AI może użyć narzędzia `read_file` do analizy zawartości.

### Limity

- **Max rozmiar**: 10MB na plik (konfigurowalny w `mcp_config.json`)
- **Max plików**: Nieograniczona liczba (zalecane do 5)
- **Bezpieczeństwo**: Pliki zapisywane tylko w sandboxed directory

---

## 💻 Edytor kodu

### Funkcjonalność

Wbudowany edytor kodu z wsparciem dla wielu języków programowania!

### Obsługiwane języki

- Python
- JavaScript
- TypeScript
- HTML
- CSS
- JSON
- Bash

### Jak używać

1. **Kliknij "💻 Kod"** w dolnej części chatboxa
2. **Wybierz język** z dropdown menu
3. **Wpisz kod** w edytorze (monospace font, resize vertical)
4. **Kliknij "✅ Wstaw kod do wiadomości"**
5. Kod zostanie dodany jako markdown code block

### Przykład

```python
# W edytorze:
def hello():
    print("Hello from MyBonzo!")

hello()

# W wiadomości:
```python
def hello():
    print("Hello from MyBonzo!")

hello()
```
```

### Wykonanie kodu

AI może wykonać kod używając narzędzia MCP:

```
User: Wykonaj ten kod

AI: [TOOL:execute_python]
def hello():
    print("Hello from MyBonzo!")

hello()
[/TOOL]

🔧 Użyte narzędzia:
- execute_python: 🐍 Wynik:
  Hello from MyBonzo!
```

### Keyboard shortcuts

- **Vertical resize**: Przeciągnij dolną krawędź textarea
- **Close editor**: Kliknij ✕ w prawym górnym rogu

---

## 🌓 Dark/Light Mode

### Funkcjonalność

Pełne wsparcie dla trybu ciemnego i jasnego z zachowaniem preferencji!

### Jak przełączać

1. **Kliknij ikonę** ☀️ lub 🌙 w górnym prawym rogu
2. Motyw zmieni się **natychmiast**
3. Preferencja **zapisana w localStorage**

### Theme colors

**Light Mode:**
- Background: `#ffffff`
- Text: `#333`
- User bubble: `#e3f2fd` (niebieski)
- AI bubble: `#f3f3f3` (szary)

**Dark Mode:**
- Background: `#1e1e1e`
- Text: `#e0e0e0`
- User bubble: `#0084ff` (niebieski)
- AI bubble: `#3d3d3d` (ciemny szary)

### Persystencja

Wybór motywu jest zapisywany w:
```javascript
localStorage.setItem("chatTheme", "dark" | "light")
```

Motyw zostaje **zachowany** między sesjami!

### CSS Custom Properties

Możesz dostosować kolory edytując obiekt `colors` w `ChatWidget.jsx:181-209`

---

## ⬆️ Expandable UI

### Funkcjonalność

Możliwość powiększenia chatboxa dla większej wygody!

### Jak używać

1. **Kliknij "⬆️"** w górnym prawym rogu
2. Chatbox **rozszerza się** do 90% szerokości ekranu
3. Textarea **zwiększa** się do 5 linii
4. Messages **scroll area** zwiększa się do 500px

### Rozmiary

**Normal mode:**
- Width: `500px`
- Textarea rows: `3`
- Messages height: `400px`

**Expanded mode:**
- Width: `90vw` (90% viewport width)
- Textarea rows: `5`
- Messages height: `500px`

### Animation

Płynne przejście CSS:
```css
transition: all 0.3s ease
```

---

## 📱 PWA - Instalacja na Androidzie

### Co to jest PWA?

**Progressive Web App** - aplikacja internetowa działająca jak natywna!

### Korzyści

- ✅ **Ikona** na ekranie głównym
- ✅ **Pełnoekranowy** tryb (bez browser UI)
- ✅ **Funkcjonalność offline**
- ✅ **Szybsze** ładowanie
- ✅ **Push notifications** (opcjonalne)

### Instalacja na Androidzie

#### Metoda 1: Automatyczny prompt

1. Otwórz stronę w **Chrome/Edge na Androidzie**
2. Pojawi się banner **"📱 Zainstaluj aplikację"**
3. Kliknij **"Instaluj"**
4. Aplikacja zostanie dodana do ekranu głównego

#### Metoda 2: Menu przeglądarki

1. Otwórz **menu** przeglądarki (⋮)
2. Wybierz **"Dodaj do ekranu głównego"** lub **"Zainstaluj aplikację"**
3. Potwierdź nazwę i kliknij **"Dodaj"**
4. Ikona pojawi się na ekranie głównym

#### Metoda 3: iOS (Safari)

1. Otwórz stronę w **Safari**
2. Kliknij przycisk **"Udostępnij"** (□↑)
3. Wybierz **"Dodaj do ekranu początkowego"**
4. Potwierdź i kliknij **"Dodaj"**

### Manifest PWA

Plik: `/public/manifest.json`

```json
{
  "name": "MyBonzo AI Chat - Local AI Assistant",
  "short_name": "MyBonzo AI",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2196F3",
  "background_color": "#ffffff",
  "icons": [...]
}
```

### Ikony PWA

Wymagane rozmiary ikon (w `/public/icons/`):
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

**Generuj ikony**:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

### Testowanie PWA

**Chrome DevTools** → **Application** → **Manifest**

Sprawdź:
- ✓ Manifest loaded
- ✓ Service worker registered
- ✓ Icons present
- ✓ Install prompt available

**Lighthouse Audit**:
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:4321
```

---

## 🔌 Funkcje offline

### Service Worker

Plik: `/public/sw.js`

### Co działa offline?

✅ **Podstawowa aplikacja**:
- Interface chatboxa
- JavaScript/CSS
- Ikony i assets

✅ **LocalStorage**:
- Theme preferences
- Cached messages (opcjonalne)

❌ **Wymaga połączenia**:
- API calls do backendu
- MCP tools (web search)
- File uploads

### Strategia cache

**Cache-first** dla:
- Static assets (HTML, CSS, JS)
- Ikony i obrazy

**Network-first** dla:
- API endpoints (`/api/*`)
- Dynamic content

### Background Sync

Opcjonalnie - synchronizacja wiadomości offline:

```javascript
// W Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
});
```

Użycie:
```javascript
// W aplikacji
if ('serviceWorker' in navigator && 'sync' in registration) {
  await registration.sync.register('sync-messages');
}
```

### Push Notifications

Opcjonalnie - powiadomienia o nowych wiadomościach:

```javascript
// Request permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
  });
}
```

### Debugowanie offline

**Chrome DevTools**:
1. **Network** → ✓ **Offline**
2. **Application** → **Service Workers** → **Offline**
3. Testuj funkcjonalność

---

## 🎨 Dodatkowe funkcje UI

### Auto-scroll

Automatyczne przewijanie do najnowszej wiadomości:

```javascript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

### Clear chat

Przycisk **🗑️** czyści całą historię rozmowy.

### Keyboard shortcuts

- **Enter** - Wyślij wiadomość
- **Shift + Enter** - Nowa linia w textarea

### File preview

Lista załączonych plików z:
- Nazwa pliku
- Rozmiar w KB
- Przycisk usuwania ✕

### Connection status

Indicator pokazuje status połączenia z backendem:
- 🟢 **Connected** - Wszystko działa
- 🔴 **Error** - Backend niedostępny
- 🟠 **Unknown** - Sprawdzanie...

---

## 🛠️ Konfiguracja

### Frontend

**Environment variables** (`.dev.vars`):
```env
PUBLIC_BACKEND_URL=http://localhost:8000/api
```

### Backend

**File upload directory** (`.env`):
```env
MCP_SAFE_DIR=./mcp_workspace
```

Pliki uploadu trafią do:
```
./mcp_workspace/uploads/
```

### PWA Settings

**Manifest** (`/public/manifest.json`):
- Zmień `name`, `short_name`
- Dostosuj `theme_color`, `background_color`
- Dodaj własne ikony

**Service Worker** (`/public/sw.js`):
- Zmień `CACHE_NAME` przy aktualizacji
- Dodaj URLs do `urlsToCache`
- Dostosuj cache strategy

---

## 📊 Performance Tips

### Optymalizacja uploadu plików

```javascript
// Kompresja obrazów przed uploadem
const compressImage = async (file) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await createImageBitmap(file);

  canvas.width = Math.min(img.width, 1920);
  canvas.height = Math.min(img.height, 1080);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
};
```

### Lazy loading

```javascript
// Lazy load code editor tylko gdy potrzebny
{showCodeEditor && <CodeEditorComponent />}
```

### Debounce typing

```javascript
// Debounce sprawdzania długości wiadomości
const debouncedCheck = useMemo(
  () => debounce((value) => checkMessageLength(value), 300),
  []
);
```

---

## 🔐 Bezpieczeństwo

### File uploads

- ✓ Whitelist rozszerzeń plików
- ✓ Max rozmiar pliku (10MB)
- ✓ Sandboxed directory
- ✓ Filename sanitization

### Code execution

- ✓ Timeout (5s)
- ✓ Blocked imports (`os`, `sys`, `subprocess`)
- ✓ Subprocess isolation
- ✓ No shell access

### PWA

- ✓ HTTPS required w produkcji
- ✓ Service Worker scope limited
- ✓ Content Security Policy

---

## 📝 TODO / Future Features

- [ ] **Drag & drop** dla file uploads
- [ ] **Syntax highlighting** w code preview
- [ ] **Voice input** (Web Speech API)
- [ ] **Export chat** do PDF/TXT
- [ ] **Multi-language** support
- [ ] **Custom themes** editor
- [ ] **Shortcuts panel** z dostępnymi MCP tools

---

**Stworzone z ❤️ dla MyBonzo AI Chat**

Wersja: 2.0.0 | Data: 2024-01-15
