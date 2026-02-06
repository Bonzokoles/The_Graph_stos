# 🔧 Setup Instructions for 01-ai-blog

## ⚠️ Manual Directory Creation Required

Since PowerShell 7+ is not available, please create these directories manually:

```
Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog\
├── src\
│   ├── components\      ← CREATE THIS
│   ├── pages\          ← CREATE THIS
│   │   └── api\        ← CREATE THIS
│   └── styles\         ← CREATE THIS
└── functions\          ← CREATE THIS
    └── api\            ← CREATE THIS
```

## 📝 Step-by-Step Setup

### 1. Create Directory Structure

Open Command Prompt or File Explorer and create:

```cmd
cd Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog
mkdir src
mkdir src\components
mkdir src\pages
mkdir src\pages\api
mkdir src\styles
mkdir functions
mkdir functions\api
```

### 2. Copy Component Files

After creating directories, download or create these files:

**Create: `src\components\ChatWidget.jsx`**
- This is the main React chat component
- See the example in `chatbot\src\components\ChatWidget.jsx` as reference
- Enhanced version available in repository

**Create: `src\pages\index.astro`**
```astro
---
import React from "react";
import ChatWidget from "../components/ChatWidget.jsx";
---
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MyBonzo AI Chat</title>
  </head>
  <body style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
    <main>
      <ChatWidget client:load apiBaseUrl="/api" />
    </main>
  </body>
</html>
```

**Create: `src\pages\api\chat.js`**
```javascript
export const prerender = false;

export async function POST({ request, env }) {
  try {
    const { provider, model, messages, system_prompt } = await request.json();
    
    // OpenAI implementation
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: system_prompt 
            ? [{ role: 'system', content: system_prompt }, ...messages]
            : messages,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({ 
        text: data.choices[0].message.content 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Provider not supported' 
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Create: `src\pages\api\stream.js`**
```javascript
export const prerender = false;

export async function POST({ request, env }) {
  try {
    const { provider, model, messages, system_prompt } = await request.json();
    
    // OpenAI streaming implementation
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: system_prompt 
            ? [{ role: 'system', content: system_prompt }, ...messages]
            : messages,
          stream: true,
        }),
      });

      // Stream the response back to client
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    return new Response('Provider not supported', { status: 400 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
```

### 3. Install Dependencies

```cmd
npm install
```

### 4. Configure Environment

Copy `.dev.vars.example` to `.dev.vars`:

```cmd
copy .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your API keys.

### 5. Test Locally

```cmd
npm run dev
```

Visit: http://localhost:4321

### 6. Build for Production

```cmd
npm run build
```

## 🚀 Quick Alternative: Use Existing Implementations

If manual setup is too complex, you can use one of the existing implementations:

### Option A: Use `chatbot` folder
```cmd
cd chatbot
npm install
npm run dev
```

### Option B: Use `Chatbotlocal` folder
```cmd
cd Chatbotlocal
npm install
npm run dev
```

## 📦 Next Steps

Once setup is complete:

1. ✅ Test locally
2. ✅ Create GitHub repository
3. ✅ Deploy to Cloudflare Pages
4. ✅ Integrate with main blog

See `README.md` for detailed deployment instructions.

## 🆘 Troubleshooting

### PowerShell Not Available
- Use Command Prompt (`cmd`) or File Explorer instead
- All commands can be executed in `cmd`

### Cannot Create Directories
- Use Windows File Explorer to create folders manually
- Right-click → New → Folder

### npm Not Found
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

---

**Last Updated**: November 2025  
**Status**: Manual setup required (PowerShell 7+ not available)
