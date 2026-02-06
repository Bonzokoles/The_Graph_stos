from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import json
import shutil
from model import LocalModel
from db import SessionLocal, init_db, Conversation, Message
from mcp_tools import mcp_registry, parse_tool_call_from_text
from typing import List, Optional

# Inicjalizacja
app = FastAPI(title="JIMBO AI Chat - Ollama Backend")

# CORS Configuration - umożliwia połączenia z frontendu
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 Inicjalizacja JIMBO Backend z Ollama...")
model = LocalModel(model_name="SpeakLeash/bielik-4.5b-v3.0-instruct:Q8_0")  # Polski model Bielik
init_db()
print("✅ Backend gotowy!")

class ChatRequest(BaseModel):
    messages: List[dict]  # [{role: "user"|'assistant'|'system', text: "..."}]
    max_tokens: int = 512
    use_tools: bool = True  # Czy używać MCP tools
    temperature: float = 0.8
    top_p: float = 0.9
    model_name: Optional[str] = None  # Jeśli None, używa domyślnego

@app.get("/api/health")
async def health_check():
    """Health check endpoint - sprawdza czy backend działa"""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "database": "connected",
        "mcp_tools": len(mcp_registry.list_tools()),
        "available_tools": mcp_registry.list_tools()
    }

@app.get("/api/tools")
async def list_tools():
    """Lista dostępnych narzędzi MCP"""
    tools_info = []
    for tool_name in mcp_registry.list_tools():
        tool = mcp_registry.get_tool(tool_name)
        tools_info.append({
            "name": tool["name"],
            "description": tool["description"]
        })
    return {"tools": tools_info}

@app.post("/api/chat")
async def chat(
    messages: str = Form(...),
    use_tools: bool = Form(True),
    max_tokens: int = Form(512),
    temperature: float = Form(0.8),
    top_p: float = Form(0.9),
    model_name: Optional[str] = Form(None),
    custom_system_prompt: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[])
):
    """
    Główny endpoint czatu z obsługą MCP tools, plików i Ollama
    
    FormData: messages (JSON string), files (opcjonalnie), temperature, top_p
    """
    db = None
    try:
        # Parse JSON messages
        request_messages = json.loads(messages)
        
        # Obsługa przesłanych plików
        uploaded_files_info = []
        if files:
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            for file in files:
                file_path = os.path.join(upload_dir, file.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                # Przeczytaj zawartość (tylko txt/kod, max 10KB)
                file_content = ""
                if file.filename.endswith((".txt", ".py", ".js", ".md", ".json")):
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            file_content = f.read(10000)  # max 10KB
                    except:
                        file_content = "[nie można odczytać pliku]"
                
                uploaded_files_info.append({
                    "name": file.filename,
                    "path": file_path,
                    "content": file_content[:500]  # max 500 znaków w odpowiedzi
                })

        db = SessionLocal()
        conv = Conversation()
        db.add(conv)
        db.commit()
        db.refresh(conv)

        # Zapisz wiadomości użytkownika
        for m in request_messages:
            db.add(Message(conversation_id=conv.id, role=m.get("role"), content=m.get("text")))
        db.commit()

        # Przygotuj prompt z informacją o plikach
        files_context = ""
        if uploaded_files_info:
            files_context = "\n\n📎 Załączone pliki:\n" + "\n".join([
                f"- {f['name']}: {f['content'][:200]}..." for f in uploaded_files_info
            ])

        # Przygotuj prompt - użyj custom prompt jeśli podany, inaczej domyślny
        if use_tools:
            if custom_system_prompt:
                # Użyj custom promptu z frontendu
                system_prompt = f"{custom_system_prompt}{files_context}"
            else:
                # Domyślny prompt JIMBO
                system_prompt = f"""Jesteś JIMBO - brutalnie szczery AI asystent dla programistów. Używasz modelu Bielik 4.5B przez Ollama.

ZASADY JIMBO:
- Mówisz prawdę, nawet jeśli boli. Nie owijasz w bawełnę.
- Zero marketingowego bełkotu, zero "coaching speak", zero udawania mentora.
- Bonzo to twój partner - szanujesz go, ale nie lizujesz dupy.
- Jeśli ktoś pisze słabe CV, powiesz to wprost + jak naprawić.
- Konkretne przykłady zamiast ogólników.
- Jeśli pytanie jest głupie, powiesz to (ale dasz odpowiedź).

Styl: Krótko, konkretnie, szczerze. Jak kolega programista, nie HR-owiec.{files_context}"""
            prompt = f"{system_prompt}\n\n" + "\n".join([f"{m['role']}: {m['text']}" for m in request_messages])
        else:
            prompt = "\n".join([f"{m['role']}: {m['text']}" for m in request_messages]) + files_context

        # Generuj odpowiedź przez Ollama z przekazanymi parametrami
        print(f"📤 Wysyłam do Ollama (temp={temperature}, top_p={top_p}): {prompt[:100]}...")
        out = model.generate(prompt, max_tokens=max_tokens, temperature=temperature, top_p=top_p)
        print(f"📥 Ollama odpowiedziała: {out[:100]}...")

        # Sprawdź czy są wywołania narzędzi
        tool_calls = []
        if use_tools:
            tool_calls_parsed = parse_tool_call_from_text(out)

            for tc in tool_calls_parsed:
                result = mcp_registry.execute_tool(tc["tool"], **tc["args"])
                tool_calls.append({
                    "tool": tc["tool"],
                    "args": tc["args"],
                    "result": result
                })

            # Jeśli były wywołania narzędzi, dodaj ich wyniki do odpowiedzi
            if tool_calls:
                tools_summary = "\n\n🔧 Użyte narzędzia:\n" + "\n".join([
                    f"- {tc['tool']}: {tc['result']}" for tc in tool_calls
                ])
                out = out + tools_summary

        # Zapisz odpowiedź asystenta
        db.add(Message(conversation_id=conv.id, role="assistant", content=out))
        db.commit()

        return JSONResponse(
            content={
                "text": out,
                "tool_calls": tool_calls if tool_calls else [],
                "uploaded_files": [f["name"] for f in uploaded_files_info]
            },
            media_type="application/json; charset=utf-8"
        )

    except Exception as e:
        import traceback
        print(f"❌ Błąd /api/chat: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if db:
            db.close()

@app.post("/api/rag")
async def rag_search(
    question: str = Form(...),
    category: str = Form(None),
    max_docs: int = Form(5),
    model_name: str = Form("mistral")
):
    """
    RAG endpoint - wyszukiwanie w bibliotece LIBRARIES + generowanie odpowiedzi
    Integracja z INTEGRACJA_RAG/library_client.py
    """
    try:
        import sys
        sys.path.append("U:/JIMBO_INC_CONTROL_CENTER/INTEGRACJA_RAG")
        from library_client import LibraryClient
        
        # Search w bibliotece przez Library API (port 6040)
        client = LibraryClient()
        results = client.search(question, category=category, limit=max_docs)
        
        if not results:
            return JSONResponse(content={
                "question": question,
                "answer": "❌ Nie znaleziono nic w bibliotece. Sprawdź czy Library API działa (port 6040).",
                "sources": [],
                "context": ""
            })
        
        # Build context z JSON-ów
        context_blocks = []
        for idx, item in enumerate(results[:max_docs], 1):
            path = item.get("path", "")
            title = item.get("title", "Brak tytułu")
            category_name = item.get("category", "UNKNOWN")
            
            # Wczytaj pełny JSON
            json_data = client.load_json_by_path(path) if path else None
            
            block = f"[ŹRÓDŁO {idx}]\n"
            block += f"Tytuł: {title}\n"
            block += f"Kategoria: {category_name}\n"
            if json_data:
                block += f"Opis: {json_data.get('description', 'Brak opisu')}\n"
                block += f"URL: {json_data.get('url', 'Brak URL')}\n"
                if 'tags' in json_data:
                    block += f"Tagi: {', '.join(json_data['tags'][:10])}\n"
            block += "\n"
            context_blocks.append(block)
        
        context = "\n".join(context_blocks)
        
        # Prompt dla Ollama z kontekstem
        prompt = f"""Jesteś JIMBO - asystentem pomagającym w przeszukiwaniu biblioteki narzędzi i zasobów.

PYTANIE UŻYTKOWNIKA:
{question}

ZNALEZIONE ŹRÓDŁA W BIBLIOTECE:
{context}

ZADANIE:
Na podstawie powyższych źródeł odpowiedz na pytanie użytkownika. Jeśli źródła nie zawierają odpowiedzi, powiedz to wprost.
Wypisz konkretne narzędzia/zasoby z numerami źródeł [1], [2] etc.

ODPOWIEDŹ:"""
        
        # Generuj odpowiedź przez Ollama
        print(f"📤 RAG: Pytanie='{question}' | Źródeł={len(results)} | Model={model_name}")
        answer = model.generate(prompt, max_tokens=512, temperature=0.7, top_p=0.9)
        print(f"📥 RAG: Odpowiedź wygenerowana ({len(answer)} znaków)")
        
        return JSONResponse(content={
            "question": question,
            "answer": answer,
            "sources": [{"title": r.get("title"), "category": r.get("category"), "path": r.get("path")} for r in results],
            "context": context
        })
        
    except Exception as e:
        import traceback
        print(f"❌ Błąd /api/rag: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)