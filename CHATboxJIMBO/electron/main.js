const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess = null;
const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = 8000;
const FRONTEND_PORT = isDev ? 4322 : null;

// Ścieżki do backendu
const backendPath = path.join(__dirname, '..', 'Chatbotlocal', 'backend');
const venvPython = path.join(backendPath, 'venv', 'Scripts', 'python.exe');
const systemPython = 'python'; // fallback

// Register custom protocol before app is ready
app.whenReady().then(() => {
    // Intercept file:// protocol to fix paths
    protocol.interceptFileProtocol('file', (request, callback) => {
        let url = request.url.substr(7); // Remove 'file://'

        // Fix paths starting with /_astro/ or /manifest.json or /sw.js
        if (url.startsWith('/_astro/') || url.startsWith('/M:/_astro/')) {
            url = path.join(__dirname, '..', 'dist', url.replace(/^(\/M:)?\//, ''));
        } else if (url.startsWith('/manifest.json') || url.startsWith('/M:/manifest.json')) {
            url = path.join(__dirname, '..', 'dist', 'manifest.json');
        } else if (url.startsWith('/sw.js') || url.startsWith('/M:/sw.js')) {
            url = path.join(__dirname, '..', 'dist', 'sw.js');
        } else if (url.startsWith('/icons/') || url.startsWith('/M:/icons/')) {
            url = path.join(__dirname, '..', 'dist', url.replace(/^(\/M:)?\//, ''));
        }

        callback({ path: url });
    });

    createWindow();
    startBackend();
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        title: 'JIMBO AI Chat - Lokalna Aplikacja',
        backgroundColor: '#000000',
        icon: path.join(__dirname, 'resources', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        },
        autoHideMenuBar: true,
        frame: true
    });

    // Development: załaduj localhost:4322
    // Production: załaduj z dist/
    const startURL = isDev
        ? `http://localhost:${FRONTEND_PORT}`
        : `file://${path.join(__dirname, '..', 'dist', 'index.html')}`;

    mainWindow.loadURL(startURL);

    // Zawsze otwieraj DevTools żeby debugować
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Status bar - pokaż backend status
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('backend-status', {
            running: backendProcess !== null,
            port: BACKEND_PORT
        });
    });
}

function startBackend() {
    if (backendProcess) {
        console.log('⚠️ Backend już działa');
        return;
    }

    // Sprawdź czy venv Python istnieje
    const pythonExe = fs.existsSync(venvPython) ? venvPython : systemPython;
    const mainPy = path.join(backendPath, 'app', 'main.py');

    console.log(`🐍 Uruchamianie backendu: ${pythonExe}`);
    console.log(`📁 Backend path: ${backendPath}`);

    try {
        backendProcess = spawn(pythonExe, [mainPy], {
            cwd: backendPath,
            env: {
                ...process.env,
                PYTHONUNBUFFERED: '1',
                MCP_SAFE_DIR: path.join(backendPath, 'mcp_workspace'),
                ALLOWED_ORIGINS: '*'
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        backendProcess.stdout.on('data', (data) => {
            console.log(`[Backend] ${data.toString().trim()}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`[Backend Error] ${data.toString().trim()}`);
        });

        backendProcess.on('close', (code) => {
            console.log(`🛑 Backend zatrzymany (code ${code})`);
            backendProcess = null;
            if (mainWindow) {
                mainWindow.webContents.send('backend-status', {
                    running: false,
                    port: BACKEND_PORT
                });
            }
        });

        backendProcess.on('error', (err) => {
            console.error(`❌ Błąd backendu: ${err.message}`);
            backendProcess = null;
        });

        console.log(`✅ Backend uruchomiony (PID: ${backendProcess.pid})`);

        // Odczekaj 3s żeby backend się załadował
        setTimeout(() => {
            if (mainWindow) {
                mainWindow.webContents.send('backend-status', {
                    running: true,
                    port: BACKEND_PORT,
                    url: `http://localhost:${BACKEND_PORT}/api`
                });
            }
        }, 3000);

    } catch (error) {
        console.error(`❌ Nie udało się uruchomić backendu: ${error.message}`);
    }
}

function stopBackend() {
    if (backendProcess) {
        console.log('🛑 Zatrzymywanie backendu...');
        backendProcess.kill();
        backendProcess = null;
    }
}

// IPC Handlers
ipcMain.handle('get-backend-status', () => {
    return {
        running: backendProcess !== null,
        port: BACKEND_PORT,
        url: `http://localhost:${BACKEND_PORT}/api`
    };
});

ipcMain.handle('restart-backend', () => {
    stopBackend();
    setTimeout(() => startBackend(), 1000);
    return { success: true };
});

// USUNIĘTE: app.whenReady() jest już na górze pliku z protocol interceptor

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopBackend();
});

// Graceful shutdown
process.on('SIGINT', () => {
    stopBackend();
    app.quit();
});

process.on('SIGTERM', () => {
    stopBackend();
    app.quit();
});
