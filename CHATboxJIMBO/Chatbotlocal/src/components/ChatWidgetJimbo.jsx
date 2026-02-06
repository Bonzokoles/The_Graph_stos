import React, { useState, useEffect, useRef } from "react";

/**
 * JIMBO-style ChatWidget z 3-kolumnowym layoutem
 * Zachowane funkcje: MCP tools, file upload, code editor, themes, PWA
 * Nowy design: JIMBO_CHAT_UI.html (3-panel grid, CSS variables, minimalistyczny styl)
 */

export default function ChatWidgetJimbo({ apiBaseUrl = "/api" }) {
    const [messages, setMessages] = useState([
        { id: 0, role: "system", text: "JIMBO: mówisz prawdę, nie głaszczesz. Bonzo jest partnerem, nie klientem. Zero korpo-tekstu." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("unknown");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [codeContent, setCodeContent] = useState("");
    const [codeLanguage, setCodeLanguage] = useState("python");
    const [selectedModel, setSelectedModel] = useState("JIMBO · 7B");
    const [temperature, setTemperature] = useState(0.8);
    const [topP, setTopP] = useState(0.9);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showRightbar, setShowRightbar] = useState(true);
    const [mcpConnected, setMcpConnected] = useState(false);
    const [availableTools, setAvailableTools] = useState([]);
    const [showToolsPanel, setShowToolsPanel] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(`Jesteś JIMBO. Mówisz prawdę, nawet jeśli boli.
Nie głaszczesz, nie kłamiesz, nie udajesz coacha.
Bonzo jest twoim partnerem.
Masz być szczery, konkretny, bez marketingowego bełkotu.`);
    const [editingPrompt, setEditingPrompt] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiProvider, setApiProvider] = useState("local"); // local, openai, anthropic, google, openrouter
    const [openaiKey, setOpenaiKey] = useState(localStorage.getItem("openai_key") || "");
    const [anthropicKey, setAnthropicKey] = useState(localStorage.getItem("anthropic_key") || "");
    const [googleKey, setGoogleKey] = useState(localStorage.getItem("google_key") || "");
    const [openrouterKey, setOpenrouterKey] = useState(localStorage.getItem("openrouter_key") || "");

    const controllerRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Check backend connection
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/health`, { method: "GET" });
                setConnectionStatus(res.ok ? "connected" : "error");

                // Fetch available MCP tools if connected
                if (res.ok) {
                    try {
                        const toolsRes = await fetch(`${apiBaseUrl}/tools`, { method: "GET" });
                        if (toolsRes.ok) {
                            const toolsData = await toolsRes.json();
                            setAvailableTools(toolsData.tools || []);
                            setMcpConnected(true);
                        }
                    } catch (err) {
                        console.error("Failed to fetch MCP tools:", err);
                    }
                }
            } catch (err) {
                setConnectionStatus("error");
                console.error("Backend connection error:", err);
            }
        };
        checkConnection();
    }, [apiBaseUrl]); const sendMessage = async () => {
        if (!input.trim() && uploadedFiles.length === 0) return;

        let messageText = input.trim();
        if (uploadedFiles.length > 0) {
            messageText += "\n\n📎 Załączone pliki:\n" + uploadedFiles.map(f => f.name).join("\n");
        }

        const userMsg = { id: Date.now(), role: "user", text: messageText, files: uploadedFiles };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const formData = new FormData();

            // Zawsze wysyłaj jako FormData (backend tego wymaga)
            // Filtruj tylko user/assistant messages (pomijaj system)
            const allMessages = [...messages, userMsg]
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, text: m.text }));
            formData.append("messages", JSON.stringify(allMessages));
            formData.append("use_tools", "true");
            formData.append("max_tokens", "512");
            formData.append("temperature", temperature.toString());
            formData.append("top_p", topP.toString());
            formData.append("custom_system_prompt", systemPrompt);  // Wysyłaj custom prompt

            // Dodaj pliki
            uploadedFiles.forEach(file => formData.append("files", file));

            const res = await fetch(`${apiBaseUrl}/chat`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(`Backend error (${res.status})`);

            const data = await res.json();

            // Wyczyść pliki po wysłaniu
            setUploadedFiles([]);

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
                text: `❌ Błąd połączenia:\n${err.message}\n\nSprawdź backend: ${apiBaseUrl}`
            };
            setMessages((m) => [...m, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const insertCode = () => {
        if (codeContent.trim()) {
            setInput(prev => prev + `\n\`\`\`${codeLanguage}\n${codeContent}\n\`\`\`\n`);
            setCodeContent("");
            setShowCodeEditor(false);
        }
    };

    const clearChat = () => {
        setMessages([{ id: 0, role: "system", text: "Czat wyczyszczony. Jak mogę pomóc?" }]);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const connectMCP = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/tools`, { method: "GET" });
            if (res.ok) {
                const data = await res.json();
                setAvailableTools(data.tools || []);
                setMcpConnected(true);
                setShowToolsPanel(true);
            } else {
                throw new Error("Failed to connect to MCP");
            }
        } catch (err) {
            alert(`Błąd połączenia z MCP: ${err.message}\n\nUpewnij się że backend działa na ${apiBaseUrl}`);
        }
    };

    const statusDot = {
        connected: "#52ff8f",
        error: "#ff5252",
        unknown: "#ffa726"
    }[connectionStatus];

    const styles = {
        container: {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            background: "radial-gradient(circle at top left, #25253a 0, #050509 55%)",
            color: "#f5f5f5",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
        },
        header: {
            height: 52,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "linear-gradient(90deg, rgba(255,255,255,0.03), transparent)"
        },
        title: {
            margin: 0,
            fontSize: "1.1rem",
            letterSpacing: "0.03em"
        },
        subtitle: {
            fontSize: "0.75rem",
            color: "#a7a7b3"
        },
        status: {
            fontSize: "0.8rem",
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 999,
            background: statusDot
        },
        layout: {
            flex: 1,
            display: "grid",
            gridTemplateColumns: showSidebar && showRightbar ? "260px minmax(0, 1.6fr) 320px" :
                showSidebar ? "260px minmax(0, 1fr)" :
                    showRightbar ? "minmax(0, 1fr) 320px" : "minmax(0, 1fr)",
            gap: 0,
            minHeight: 0
        },
        sidebar: {
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "#0b0b12",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto"
        },
        sidebarHeader: {
            padding: "10px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        },
        sectionTitle: {
            padding: "8px 12px 4px",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#77778a"
        },
        modelList: {
            listStyle: "none",
            margin: 0,
            padding: "0 8px 8px"
        },
        modelItem: (active) => ({
            borderRadius: 10,
            padding: "6px 8px",
            fontSize: "0.8rem",
            cursor: "pointer",
            background: active ? "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))" : "transparent",
            border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
            marginBottom: 4
        }),
        chatPanel: {
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            background: "radial-gradient(circle at top center, #181828 0, #050509 55%)"
        },
        chatHeader: {
            padding: "8px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        },
        chatBody: {
            flex: 1,
            padding: "10px 14px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8
        },
        msg: (role) => {
            const baseStyle = {
                maxWidth: "80%",
                padding: "8px 10px",
                borderRadius: 10,
                fontSize: "0.9rem",
                lineHeight: 1.4,
                border: "1px solid transparent"
            };

            if (role === "user") {
                return { ...baseStyle, alignSelf: "flex-end", background: "linear-gradient(135deg, #f5f5f5, #dcdcf0)", color: "#15151a", borderColor: "rgba(255,255,255,0.35)" };
            } else if (role === "assistant") {
                return { ...baseStyle, alignSelf: "flex-start", background: "rgba(10,10,18,0.9)", borderColor: "rgba(255,255,255,0.12)" };
            } else if (role === "system") {
                return { ...baseStyle, alignSelf: "center", maxWidth: "100%", fontSize: "0.8rem", color: "#77778a", background: "transparent", border: "none", textAlign: "center", padding: 4 };
            } else if (role === "tool") {
                return { ...baseStyle, alignSelf: "flex-start", background: "rgba(255,152,0,0.1)", borderColor: "rgba(255,152,0,0.3)" };
            } else if (role === "error") {
                return { ...baseStyle, alignSelf: "center", background: "rgba(244,67,54,0.1)", borderColor: "rgba(244,67,54,0.3)" };
            }
            return baseStyle;
        },
        msgLabel: {
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#77778a",
            marginBottom: 2
        },
        chatInput: {
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 10px",
            background: "linear-gradient(180deg, rgba(0,0,0,0.5), #050509)"
        },
        textarea: {
            flex: 1,
            resize: "none",
            minHeight: 48,
            maxHeight: 120,
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.45)",
            color: "#f5f5f5",
            fontSize: "0.9rem",
            outline: "none",
            fontFamily: "inherit"
        },
        sendBtn: {
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "#f5f5f5",
            color: "#15151a",
            fontSize: "0.85rem",
            padding: "8px 14px",
            cursor: "pointer",
            whiteSpace: "nowrap"
        },
        rightbar: {
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            background: "#0b0b12",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto"
        },
        rightSection: {
            padding: "8px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
        },
        paramGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 6,
            marginTop: 6
        },
        param: {
            padding: "6px 8px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.75rem"
        },
        paramLabel: {
            color: "#77778a",
            marginBottom: 2
        },
        button: {
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.04)",
            color: "#f5f5f5",
            fontSize: "0.75rem",
            padding: "4px 10px",
            cursor: "pointer"
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>JIMBO · Lokalny Chat</h1>
                    <div style={styles.subtitle}>MyBonzo AI - bez ściemy, bez marketingu</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* MCP Connection Button */}
                    <button
                        onClick={connectMCP}
                        style={{
                            ...styles.button,
                            background: mcpConnected ? "rgba(82, 255, 143, 0.15)" : "rgba(255, 152, 0, 0.15)",
                            borderColor: mcpConnected ? "rgba(82, 255, 143, 0.3)" : "rgba(255, 152, 0, 0.3)",
                            color: mcpConnected ? "#52ff8f" : "#ffa726",
                            padding: "6px 12px"
                        }}
                        title={mcpConnected ? `Connected - ${availableTools.length} tools` : "Connect to MCP Tools"}
                    >
                        🔧 {mcpConnected ? `MCP (${availableTools.length})` : "Connect MCP"}
                    </button>

                    <button
                        onClick={() => setShowSettings(true)}
                        style={{ ...styles.button, padding: "6px 12px", marginLeft: "8px" }}
                        title="Settings - API Keys & Configuration"
                    >
                        ⚙️
                    </button>

                    <div style={styles.status}>
                        <span style={styles.statusDot}></span>
                        <span>Model: <strong>{selectedModel}</strong></span>
                    </div>
                </div>
            </header>

            <div style={styles.layout}>
                {/* LEFT SIDEBAR */}
                {showSidebar && (
                    <aside style={styles.sidebar}>
                        <div style={styles.sidebarHeader}>
                            <span style={{ fontSize: "0.8rem", color: "#a7a7b3", textTransform: "uppercase", letterSpacing: "0.08em" }}>Modele</span>
                            <button style={styles.button} onClick={() => alert("Dodaj model - funkcja w rozwoju")}>Dodaj</button>
                        </div>

                        <div style={styles.sectionTitle}>Aktualny</div>
                        <ul style={styles.modelList}>
                            <li style={styles.modelItem(selectedModel === "JIMBO · 7B")} onClick={() => setSelectedModel("JIMBO · 7B")}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>JIMBO · 7B</span>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", color: "#a7a7b3" }}>local</span>
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#77778a" }}>tryb: szczery, brutalnie wspierający</div>
                            </li>
                        </ul>

                        <div style={styles.sectionTitle}>Inne</div>
                        <ul style={styles.modelList}>
                            <li style={styles.modelItem(selectedModel === "GPT-4")} onClick={() => setSelectedModel("GPT-4")}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>GPT-4</span>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", color: "#a7a7b3" }}>api</span>
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#77778a" }}>OpenAI - bardziej gadatliwy</div>
                            </li>
                            <li style={styles.modelItem(selectedModel === "Claude")} onClick={() => setSelectedModel("Claude")}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>Claude Sonnet</span>
                                    <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", color: "#a7a7b3" }}>api</span>
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#77778a" }}>Anthropic - analityczny</div>
                            </li>
                        </ul>

                        <div style={{ padding: "12px", marginTop: "auto" }}>
                            <button style={{ ...styles.button, width: "100%" }} onClick={() => setShowSidebar(false)}>
                                Ukryj panel
                            </button>
                        </div>
                    </aside>
                )}

                {/* CHAT PANEL */}
                <section style={styles.chatPanel}>
                    <div style={styles.chatHeader}>
                        <div>
                            <div style={{ fontSize: "0.9rem" }}>Sesja: BONZO x JIMBO</div>
                            <div style={{ fontSize: "0.75rem", color: "#a7a7b3" }}>
                                {uploadedFiles.length > 0 && `📎 ${uploadedFiles.length} plików`}
                                {showCodeEditor && " | 💻 Edytor kodu"}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            <div style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.16)", color: "#a7a7b3" }}>
                                temp: {temperature}
                            </div>
                            <div style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.16)", color: "#a7a7b3" }}>
                                top_p: {topP}
                            </div>
                            {!showSidebar && (
                                <button style={styles.button} onClick={() => setShowSidebar(true)}>☰</button>
                            )}
                            {!showRightbar && (
                                <button style={styles.button} onClick={() => setShowRightbar(true)}>⚙️</button>
                            )}
                            <button style={styles.button} onClick={clearChat}>🗑️</button>
                        </div>
                    </div>

                    <div style={styles.chatBody}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={styles.msg(msg.role)}>
                                <div style={styles.msgLabel}>{msg.role}</div>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={styles.msg("system")}>
                                <div style={styles.msgLabel}>jimbo</div>
                                Przetwarzam...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Code Editor Panel */}
                    {showCodeEditor && (
                        <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <select
                                    value={codeLanguage}
                                    onChange={(e) => setCodeLanguage(e.target.value)}
                                    style={{ padding: "4px 8px", borderRadius: 8, background: "rgba(0,0,0,0.5)", color: "#f5f5f5", border: "1px solid rgba(255,255,255,0.14)" }}
                                >
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                </select>
                                <button style={styles.button} onClick={insertCode}>Wstaw kod</button>
                                <button style={styles.button} onClick={() => setShowCodeEditor(false)}>Zamknij</button>
                            </div>
                            <textarea
                                value={codeContent}
                                onChange={(e) => setCodeContent(e.target.value)}
                                placeholder="Wpisz kod..."
                                style={{ ...styles.textarea, width: "100%", minHeight: 100, fontFamily: "monospace" }}
                            />
                        </div>
                    )}

                    {/* File Upload Preview */}
                    {uploadedFiles.length > 0 && (
                        <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                            <div style={{ fontSize: "0.8rem", marginBottom: 4, color: "#a7a7b3" }}>Załączone pliki:</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: "0.75rem" }}>
                                        📎 {file.name}
                                        <button onClick={() => removeFile(idx)} style={{ background: "transparent", border: "none", color: "#ff5252", cursor: "pointer", fontSize: "0.9rem" }}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Input */}
                    <div style={styles.chatInput}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.8rem", color: "#a7a7b3" }}>
                            <span>Tryb: <strong>szczerość bez filtra</strong></span>
                            <span style={{ fontSize: "0.75rem", color: "#77778a" }}>Enter – wyślij · Shift+Enter – nowa linia</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                multiple
                                style={{ display: "none" }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{ ...styles.button, padding: "8px 12px" }}
                                title="Załącz plik"
                            >
                                📎
                            </button>
                            <button
                                onClick={() => setShowCodeEditor(!showCodeEditor)}
                                style={{ ...styles.button, padding: "8px 12px" }}
                                title="Edytor kodu"
                            >
                                💻
                            </button>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Napisz do JIMBO, bez ściemy..."
                                style={styles.textarea}
                            />
                            <button onClick={sendMessage} disabled={loading} style={styles.sendBtn}>
                                {loading ? "⏳" : "Wyślij"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* RIGHT SIDEBAR */}
                {showRightbar && (
                    <aside style={styles.rightbar}>
                        {/* MCP Tools Panel */}
                        {showToolsPanel && mcpConnected && (
                            <div style={{ ...styles.rightSection, maxHeight: "250px", overflowY: "auto" }}>
                                <h2 style={{ margin: "0 0 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                                    🔧 MCP Tools
                                    <span style={{
                                        fontSize: "0.7rem",
                                        color: "#52ff8f",
                                        background: "rgba(82, 255, 143, 0.15)",
                                        padding: "2px 8px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(82, 255, 143, 0.3)"
                                    }}>
                                        {availableTools.length} connected
                                    </span>
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {availableTools.map((tool, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: "8px 10px",
                                                background: "rgba(255,255,255,0.02)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                borderRadius: 6,
                                                fontSize: "0.75rem"
                                            }}
                                        >
                                            <div style={{ fontWeight: 500, color: "#f5f5f5", marginBottom: 2 }}>
                                                {tool.name}
                                            </div>
                                            <div style={{ color: "#a7a7b3", fontSize: "0.7rem" }}>
                                                {tool.description || "No description"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.rightSection}>
                            <h2 style={{ margin: "0 0 4px", fontSize: "0.85rem" }}>Parametry modelu</h2>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#a7a7b3" }}>Lokalnie ładowany model, tuning pod BONZO → JIMBO</p>
                            <div style={styles.paramGrid}>
                                <div style={styles.param}>
                                    <div style={styles.paramLabel}>Model</div>
                                    <div style={{ fontWeight: 500 }}>{selectedModel}</div>
                                </div>
                                <div style={styles.param}>
                                    <div style={styles.paramLabel}>Context</div>
                                    <div style={{ fontWeight: 500 }}>4096 tok.</div>
                                </div>
                                <div style={styles.param}>
                                    <div style={styles.paramLabel}>Temperature</div>
                                    <div style={{ fontWeight: 500 }}>
                                        <input
                                            type="number"
                                            value={temperature}
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            step="0.1"
                                            min="0"
                                            max="2"
                                            style={{ width: "100%", background: "transparent", border: "none", color: "#f5f5f5", outline: "none" }}
                                        />
                                    </div>
                                </div>
                                <div style={styles.param}>
                                    <div style={styles.paramLabel}>Top P</div>
                                    <div style={{ fontWeight: 500 }}>
                                        <input
                                            type="number"
                                            value={topP}
                                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            style={{ width: "100%", background: "transparent", border: "none", color: "#f5f5f5", outline: "none" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <h3 style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#77778a" }}>
                                    Prompt systemowy
                                </h3>
                                <button
                                    onClick={() => setEditingPrompt(!editingPrompt)}
                                    style={{ ...styles.button, padding: "2px 8px", fontSize: "0.7rem" }}
                                >
                                    {editingPrompt ? "💾 Zapisz" : "✏️ Edytuj"}
                                </button>
                            </div>
                            {editingPrompt ? (
                                <textarea
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    autoFocus
                                    spellCheck={false}
                                    style={{
                                        width: "calc(100% - 16px)",
                                        minHeight: 120,
                                        margin: "4px 0 0",
                                        padding: "6px 8px",
                                        background: "rgba(0,0,0,0.4)",
                                        borderRadius: 8,
                                        fontFamily: "monospace",
                                        fontSize: "0.75rem",
                                        border: "1px solid rgba(255,255,255,0.18)",
                                        color: "#f5f5f5",
                                        outline: "none",
                                        resize: "vertical",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Wpisz instrukcje dla JIMBO..."
                                />
                            ) : (
                                <pre style={{
                                    margin: "4px 0 0",
                                    padding: "6px 8px",
                                    background: "rgba(0,0,0,0.4)",
                                    borderRadius: 8,
                                    fontFamily: "monospace",
                                    fontSize: "0.75rem",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "#a7a7b3"
                                }}>
                                    {systemPrompt}
                                </pre>
                            )}
                        </div>

                        <div style={{ padding: "8px 12px", flex: 1, overflowY: "auto", fontSize: "0.75rem", color: "#77778a" }}>
                            <h3 style={{ margin: "0 0 4px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Logi</h3>
                            {messages.slice(-5).map((msg, idx) => (
                                <div key={idx} style={{ padding: "2px 0", borderBottom: "1px dashed rgba(255,255,255,0.08)" }}>
                                    [{new Date().toLocaleTimeString()}] {msg.role}: {msg.text.substring(0, 40)}...
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: "12px" }}>
                            <button style={{ ...styles.button, width: "100%" }} onClick={() => setShowRightbar(false)}>
                                Ukryj panel
                            </button>
                        </div>
                    </aside>
                )}
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                }}>
                    <div style={{
                        background: "#1a1a24",
                        borderRadius: 16,
                        padding: "24px",
                        maxWidth: "500px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#f5f5f5" }}>⚙️ Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#a7a7b3",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    padding: "0 8px"
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "0.9rem", color: "#a7a7b3", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                AI Provider
                            </h3>
                            <select
                                value={apiProvider}
                                onChange={(e) => setApiProvider(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    background: "rgba(0, 0, 0, 0.4)",
                                    border: "1px solid rgba(255, 255, 255, 0.18)",
                                    borderRadius: 8,
                                    color: "#f5f5f5",
                                    fontSize: "0.9rem",
                                    outline: "none",
                                    cursor: "pointer"
                                }}
                            >
                                <option value="local">Local (Ollama/Bielik)</option>
                                <option value="openai">OpenAI (GPT-4)</option>
                                <option value="anthropic">Anthropic (Claude)</option>
                                <option value="google">Google (Gemini)</option>
                                <option value="openrouter">OpenRouter (Multiple Models)</option>
                            </select>
                        </div>

                        {apiProvider === "openai" && (
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#a7a7b3", marginBottom: "6px" }}>
                                    OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => {
                                        setOpenaiKey(e.target.value);
                                        localStorage.setItem("openai_key", e.target.value);
                                    }}
                                    placeholder="sk-proj-..."
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        background: "rgba(0, 0, 0, 0.4)",
                                        border: "1px solid rgba(255, 255, 255, 0.18)",
                                        borderRadius: 8,
                                        color: "#f5f5f5",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <p style={{ fontSize: "0.75rem", color: "#77778a", marginTop: "6px" }}>
                                    Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: "#52ff8f" }}>platform.openai.com</a>
                                </p>
                            </div>
                        )}

                        {apiProvider === "anthropic" && (
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#a7a7b3", marginBottom: "6px" }}>
                                    Anthropic API Key
                                </label>
                                <input
                                    type="password"
                                    value={anthropicKey}
                                    onChange={(e) => {
                                        setAnthropicKey(e.target.value);
                                        localStorage.setItem("anthropic_key", e.target.value);
                                    }}
                                    placeholder="sk-ant-..."
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        background: "rgba(0, 0, 0, 0.4)",
                                        border: "1px solid rgba(255, 255, 255, 0.18)",
                                        borderRadius: 8,
                                        color: "#f5f5f5",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <p style={{ fontSize: "0.75rem", color: "#77778a", marginTop: "6px" }}>
                                    Get your key at <a href="https://console.anthropic.com/" target="_blank" style={{ color: "#52ff8f" }}>console.anthropic.com</a>
                                </p>
                            </div>
                        )}

                        {apiProvider === "google" && (
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#a7a7b3", marginBottom: "6px" }}>
                                    Google API Key
                                </label>
                                <input
                                    type="password"
                                    value={googleKey}
                                    onChange={(e) => {
                                        setGoogleKey(e.target.value);
                                        localStorage.setItem("google_key", e.target.value);
                                    }}
                                    placeholder="AIza..."
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        background: "rgba(0, 0, 0, 0.4)",
                                        border: "1px solid rgba(255, 255, 255, 0.18)",
                                        borderRadius: 8,
                                        color: "#f5f5f5",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <p style={{ fontSize: "0.75rem", color: "#77778a", marginTop: "6px" }}>
                                    Get your key at <a href="https://makersuite.google.com/app/apikey" target="_blank" style={{ color: "#52ff8f" }}>makersuite.google.com</a>
                                </p>
                            </div>
                        )}

                        {apiProvider === "openrouter" && (
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "#a7a7b3", marginBottom: "6px" }}>
                                    OpenRouter API Key
                                </label>
                                <input
                                    type="password"
                                    value={openrouterKey}
                                    onChange={(e) => {
                                        setOpenrouterKey(e.target.value);
                                        localStorage.setItem("openrouter_key", e.target.value);
                                    }}
                                    placeholder="sk-or-v1-..."
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        background: "rgba(0, 0, 0, 0.4)",
                                        border: "1px solid rgba(255, 255, 255, 0.18)",
                                        borderRadius: 8,
                                        color: "#f5f5f5",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <p style={{ fontSize: "0.75rem", color: "#77778a", marginTop: "6px" }}>
                                    Get your key at <a href="https://openrouter.ai/keys" target="_blank" style={{ color: "#52ff8f" }}>openrouter.ai/keys</a>
                                </p>
                                <div style={{
                                    marginTop: "12px",
                                    padding: "12px",
                                    background: "rgba(255, 165, 38, 0.08)",
                                    border: "1px solid rgba(255, 165, 38, 0.2)",
                                    borderRadius: 8
                                }}>
                                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#ffa726" }}>
                                        💡 <strong>OpenRouter benefits:</strong> Access 100+ models (GPT-4, Claude, Gemini, Llama, Mistral) with single API key. Pay-per-use pricing.
                                    </p>
                                </div>
                            </div>
                        )}

                        {apiProvider === "local" && (
                            <div style={{
                                padding: "16px",
                                background: "rgba(82, 255, 143, 0.08)",
                                border: "1px solid rgba(82, 255, 143, 0.2)",
                                borderRadius: 8,
                                marginBottom: "20px"
                            }}>
                                <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#52ff8f" }}>✅ Local Mode Active</h4>
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "#a7a7b3" }}>
                                    Using Ollama with Bielik 4.5B model. No API key required. Data stays on your machine.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => setShowSettings(false)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: "linear-gradient(135deg, rgba(82, 255, 143, 0.18), rgba(82, 255, 143, 0.08))",
                                border: "1px solid rgba(82, 255, 143, 0.3)",
                                borderRadius: 8,
                                color: "#52ff8f",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                marginTop: "12px"
                            }}
                        >
                            Save & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
