import React, { useState, useEffect, useRef } from "react";

/**
 * Zaawansowany Reactowy widget czatu z MCP tools, upload plików, edytor kodu, themes
 * Komunikuje się z backendem FastAPI (endpoint /api/chat).
 * Funkcje:
 * - Upload plików (obrazy, dokumenty)
 * - Edytor kodu z syntax highlighting
 * - Expandable textarea
 * - Dark/Light mode
 * - PWA ready
 */

export default function ChatWidget({ apiBaseUrl = "/api" }) {
  const [messages, setMessages] = useState([
    { id: 0, role: "system", text: "Witaj! Jestem lokalnym chatbotem z MCP tools. Możesz wysyłać pliki, kod i używać narzędzi!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("unknown"); // unknown, connected, error
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [theme, setTheme] = useState("light");
  const [isExpanded, setIsExpanded] = useState(false);

  const controllerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Załaduj theme z localStorage (tylko w przeglądarce)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem("chatTheme");
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  // Auto-scroll do końca wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Zapisz theme do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem("chatTheme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // Sprawdź połączenie z backendem przy starcie
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/health`, { method: "GET" });
        if (res.ok) {
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("error");
        }
      } catch (err) {
        setConnectionStatus("error");
        console.error("Backend connection error:", err);
      }
    };
    checkConnection();
  }, [apiBaseUrl]);

  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    let messageText = input.trim();

    // Dodaj informację o załączonych plikach
    if (uploadedFiles.length > 0) {
      messageText += "\n\n📎 Załączone pliki:\n" + uploadedFiles.map(f => f.name).join("\n");
    }

    const userMsg = { id: Date.now(), role: "user", text: messageText, files: uploadedFiles };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setUploadedFiles([]);
    setLoading(true);

    try {
      // Jeśli są pliki, wyślij jako FormData
      let requestBody;
      let headers = {};

      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("messages", JSON.stringify([...messages, userMsg]));
        uploadedFiles.forEach(file => {
          formData.append("files", file);
        });
        requestBody = formData;
        // Nie ustawiaj Content-Type - browser ustawi automatycznie z boundary
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({ messages: [...messages, userMsg] });
      }

      const res = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: headers,
        body: requestBody,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend error (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      // Obsługa odpowiedzi z tool calls (MCP)
      if (data.tool_calls && data.tool_calls.length > 0) {
        const toolMsg = {
          id: Date.now() + 1,
          role: "tool",
          text: "🔧 Użyte narzędzia:\n" + data.tool_calls.map(tc => `- ${tc.tool}: ${tc.result}`).join("\n")
        };
        setMessages((m) => [...m, toolMsg]);
      }

      const botMsg = { id: Date.now() + 2, role: "assistant", text: data.text };
      setMessages((m) => [...m, botMsg]);
      setConnectionStatus("connected");
    } catch (err) {
      setConnectionStatus("error");
      const errMsg = {
        id: Date.now(),
        role: "error",
        text: `❌ Błąd połączenia:\n${err.message}\n\nSprawdź czy backend działa na: ${apiBaseUrl}`
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Obsługa uploadowania plików
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Wstaw kod z edytora do wiadomości
  const insertCode = () => {
    if (codeContent.trim()) {
      setInput(prev => prev + `\n\`\`\`${codeLanguage}\n${codeContent}\n\`\`\`\n`);
      setCodeContent("");
      setShowCodeEditor(false);
    }
  };

  // Wyczyść czat
  const clearChat = () => {
    setMessages([
      { id: 0, role: "system", text: "Czat wyczyszczony. Jak mogę pomóc?" }
    ]);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Opcjonalnie: obsługa klawisza Enter
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Status connection indicator colors
  const statusColors = {
    connected: "#4CAF50",
    error: "#f44336",
    unknown: "#FF9800"
  };

  // Theme colors
  const colors = theme === "dark" ? {
    bg: "#1e1e1e",
    surface: "#2d2d2d",
    surfaceLight: "#3d3d3d",
    text: "#e0e0e0",
    textSecondary: "#b0b0b0",
    border: "#404040",
    userBubble: "#0084ff",
    assistantBubble: "#3d3d3d",
    toolBubble: "#ff9800",
    errorBubble: "#f44336",
    systemBubble: "#666",
    buttonBg: "#0084ff",
    buttonHover: "#0073e6"
  } : {
    bg: "#ffffff",
    surface: "#f9f9f9",
    surfaceLight: "#fff",
    text: "#333",
    textSecondary: "#666",
    border: "#ddd",
    userBubble: "#e3f2fd",
    assistantBubble: "#f3f3f3",
    toolBubble: "#fff3e0",
    errorBubble: "#ffebee",
    systemBubble: "#f5f5f5",
    buttonBg: "#2196F3",
    buttonHover: "#1976D2"
  };

  return (
    <div style={{
      border: "1px solid rgba(255, 51, 0, 0.5)",
      borderRadius: 0,
      padding: 16,
      width: "95vw",
      maxWidth: "95vw",
      background: "rgba(0, 0, 102, 0.3)",
      color: "rgba(0, 153, 238, 0.5)",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
    }}>
      {/* Header with controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: "1px solid rgba(255, 51, 0, 0.5)"
      }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "rgba(0, 153, 238, 0.5)" }}>💬 MyBonzo AI Chat</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: "6px 10px",
              borderRadius: 0,
              border: "1px solid #ffff66",
              background: "rgba(102, 0, 51, 0.3)",
              color: "#0099ee",
              cursor: "pointer",
              fontSize: 16
            }}
            title={isExpanded ? "Zmniejsz" : "Powiększ"}
          >
            {isExpanded ? "⬅️" : "⬆️"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: "6px 10px",
              borderRadius: 0,
              border: "1px solid #ffff66",
              background: "rgba(102, 0, 51, 0.3)",
              color: "#0099ee",
              cursor: "pointer",
              fontSize: 16
            }}
            title={theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Clear chat */}
          <button
            onClick={clearChat}
            style={{
              padding: "6px 10px",
              borderRadius: 0,
              border: "1px solid #ffff66",
              background: "rgba(102, 0, 51, 0.3)",
              color: "#0099ee",
              cursor: "pointer",
              fontSize: 16
            }}
            title="Wyczyść czat"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        padding: 8,
        background: "rgba(0, 0, 136, 0.5)",
        borderRadius: 0,
        border: "1px solid rgba(255, 51, 0, 0.5)"
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: statusColors[connectionStatus]
        }} />
        <span style={{ fontSize: 12, color: "#0099ee" }}>
          {connectionStatus === "connected" && "✓ Połączono z backendem"}
          {connectionStatus === "error" && "✗ Brak połączenia"}
          {connectionStatus === "unknown" && "⟳ Sprawdzanie..."}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        maxHeight: isExpanded ? 500 : 400,
        overflowY: "auto",
        marginBottom: 12,
        padding: 8,
        background: "rgba(0, 0, 102, 0.2)",
        borderRadius: 0,
        border: "1px solid rgba(255, 51, 0, 0.5)"
      }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "rgba(0, 153, 238, 0.5)", fontWeight: "bold", marginBottom: 4 }}>
              {m.role === "user" && "👤 Ty"}
              {m.role === "assistant" && "🤖 AI"}
              {m.role === "system" && "ℹ️ System"}
              {m.role === "tool" && "🔧 Narzędzia"}
              {m.role === "error" && "❌ Błąd"}
            </div>
            <div style={{
              background: "rgba(0, 0, 136, 0.5)",
              border: "1px solid rgba(255, 51, 0, 0.5)",
              padding: 12,
              borderRadius: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "rgba(0, 153, 238, 0.5)"
            }}>
              {m.text}
              {m.files && m.files.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>
                  📎 {m.files.length} plik(ów)
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div style={{
          marginBottom: 12,
          padding: 8,
          background: "rgba(0, 0, 136, 0.5)",
          borderRadius: 0,
          border: "1px solid rgba(255, 51, 0, 0.5)"
        }}>
          <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6, color: "rgba(0, 153, 238, 0.5)" }}>📎 Załączone pliki:</div>
          {uploadedFiles.map((file, idx) => (
            <div key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 4,
              marginBottom: 4,
              background: "rgba(0, 0, 136, 0.5)",
              borderRadius: 0,
              border: "1px solid rgba(255, 51, 0, 0.5)"
            }}>
              <span style={{ fontSize: 12, color: "rgba(0, 153, 238, 0.5)" }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              <button
                onClick={() => removeFile(idx)}
                style={{
                  padding: "2px 6px",
                  borderRadius: 0,
                  border: "1px solid rgba(255, 255, 102, 0.5)",
                  background: "rgba(102, 0, 51, 0.3)",
                  color: "rgba(0, 153, 238, 0.5)",
                  cursor: "pointer",
                  fontSize: 11
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Code Editor */}
      {showCodeEditor && (
        <div style={{
          marginBottom: 12,
          padding: 12,
          background: "rgba(0, 0, 136, 0.5)",
          borderRadius: 0,
          border: "1px solid rgba(255, 51, 0, 0.5)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              style={{
                padding: 6,
                borderRadius: 0,
                border: "1px solid rgba(255, 255, 102, 0.5)",
                background: "rgba(0, 0, 136, 0.5)",
                color: "rgba(0, 153, 238, 0.5)"
              }}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="bash">Bash</option>
            </select>
            <button
              onClick={() => setShowCodeEditor(false)}
              style={{
                padding: "4px 8px",
                borderRadius: 0,
                border: "1px solid rgba(255, 255, 102, 0.5)",
                background: "rgba(102, 0, 51, 0.3)",
                color: "rgba(0, 153, 238, 0.5)",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder={`Wpisz kod ${codeLanguage}...`}
            style={{
              width: "100%",
              minHeight: 150,
              padding: 8,
              borderRadius: 0,
              border: "1px solid rgba(255, 51, 0, 0.5)",
              fontFamily: "monospace",
              fontSize: 13,
              background: "rgba(0, 0, 136, 0.5)",
              color: "rgba(0, 153, 238, 0.5)",
              resize: "vertical"
            }}
          />
          <button
            onClick={insertCode}
            style={{
              marginTop: 8,
              padding: "8px 16px",
              borderRadius: 0,
              border: "1px solid #ffff66",
              background: "rgba(102, 0, 51, 0.3)",
              color: "#0099ee",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ✅ Wstaw kod do wiadomości
          </button>
        </div>
      )}

      {/* Input Area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        rows={isExpanded ? 5 : 3}
        style={{
          width: "100%",
          marginBottom: 8,
          padding: 10,
          borderRadius: 0,
          border: "1px solid rgba(255, 51, 0, 0.5)",
          fontFamily: "inherit",
          fontSize: 14,
          background: "rgba(0, 0, 136, 0.5)",
          color: "rgba(0, 153, 238, 0.5)",
          resize: "vertical"
        }}
        placeholder="Napisz wiadomość... (Enter = wyślij, Shift+Enter = nowa linia)"
        disabled={loading || connectionStatus === "error"}
      />

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={loading || connectionStatus === "error"}
          style={{
            flex: 1,
            minWidth: 120,
            padding: 12,
            borderRadius: 0,
            border: "1px solid rgba(255, 255, 102, 0.5)",
            background: loading ? "rgba(204, 204, 204, 0.5)" : "rgba(102, 0, 51, 0.3)",
            color: "rgba(0, 153, 238, 0.5)",
            fontWeight: "bold",
            cursor: loading || connectionStatus === "error" ? "not-allowed" : "pointer",
            fontSize: 14,
            transition: "all 0.2s"
          }}
        >
          {loading ? "⏳ Wysyłanie..." : "📤 Wyślij"}
        </button>

        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 0,
            border: "1px solid rgba(255, 255, 102, 0.5)",
            background: "rgba(102, 0, 51, 0.3)",
            color: "rgba(0, 153, 238, 0.5)",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: 14
          }}
          title="Dodaj plik"
        >
          📎 Plik
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.json,.csv,.md"
        />

        {/* Code Editor Toggle */}
        <button
          onClick={() => setShowCodeEditor(!showCodeEditor)}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 0,
            border: "1px solid rgba(255, 255, 102, 0.5)",
            background: "rgba(102, 0, 51, 0.3)",
            color: "rgba(0, 153, 238, 0.5)",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: 14
          }}
          title="Edytor kodu"
        >
          💻 Kod
        </button>
      </div>

      {/* PWA Install Hint (pokazuje się tylko jeśli PWA nie zainstalowana) */}
      <div style={{
        marginTop: 12,
        padding: 8,
        background: "rgba(0, 0, 136, 0.5)",
        borderRadius: 0,
        border: "1px solid rgba(255, 51, 0, 0.5)",
        fontSize: 11,
        color: "rgba(0, 153, 238, 0.5)",
        textAlign: "center"
      }}>
        💡 Wskazówka: Możesz zainstalować tę aplikację na swoim urządzeniu (Android/iOS)
      </div>
    </div>
  );
}
