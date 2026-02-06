# 🤖 01-ai-blog - MyBonzo AI Chat Component

**Status**: ✅ Production Ready  
**Framework**: Astro + React  
**Priority**: ⭐⭐⭐⭐⭐ (Highest)  
**Estimated Time**: 20-30 minutes

---

## 📋 Overview

Modern AI chat component with multiple AI providers, streaming responses, file uploads, and session management. Designed to integrate seamlessly with MyBonzo blog.

### ✨ Features

- 🎯 Multiple AI Providers (OpenAI, Anthropic, Google, Local)
- 📝 Streaming & Non-streaming responses
- 📎 File upload support (text files & embeddings)
- 💾 Session persistence (localStorage)
- 🎨 Role presets (Assistant, Developer, Translator, etc.)
- 🌓 Dark mode support
- 📱 Responsive design
- 🔒 Secure API key handling
- ⚡ Optimized for Cloudflare Pages

---

## 🚀 Quick Start

### 1. Installation

```powershell
cd Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog
npm install
```

### 2. Configuration

Create `.dev.vars` file:

```env
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-google-key-here
```

### 3. Development

```powershell
npm run dev
```

Visit: http://localhost:4321

### 4. Build & Test

```powershell
npm run build
npm run preview
```

---

## 📦 Project Structure

```
01-ai-blog/
├── src/
│   ├── components/
│   │   └── ChatWidget.jsx       # Main chat component
│   ├── pages/
│   │   ├── index.astro          # Demo page
│   │   └── api/
│   │       ├── chat.js          # Non-streaming endpoint
│   │       └── stream.js        # Streaming endpoint
│   ├── styles/
│   │   └── blog-theme.css       # Shared blog styles
│   └── utils/
│       └── ai-providers.js      # AI provider integrations
├── functions/
│   └── api/                     # Cloudflare Pages Functions
├── package.json
├── astro.config.mjs
├── .dev.vars.example
└── README.md
```

---

## 🎯 Deployment Workflow

### ETAP 1: Local Development ✅
Already completed! Follow Quick Start above.

### ETAP 2: GitHub Repository

```powershell
cd Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog
git init
git add .
git commit -m "feat: MyBonzo AI Chat - production ready

Features:
- Multi-provider support (OpenAI, Anthropic, Google)
- Streaming responses
- File upload & processing
- Session management
- Role presets
- Blog theme integration
- Cloudflare Pages optimized"

gh repo create mybonzo-ai-chat --public --source=. --remote=origin
git push -u origin main
```

### ETAP 3: Cloudflare Pages Deployment

**Option A: CLI Deployment**

```powershell
npm run build
wrangler pages deploy ./dist --project-name=mybonzo-ai-chat
```

**Option B: Dashboard Deployment**

1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → Create → Connect to Git
3. Select: `mybonzo-ai-chat` repository
4. Settings:
   - Framework: **Astro**
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `/`
5. Environment Variables:
   ```
   OPENAI_API_KEY=sk-proj-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=...
   ```
6. Deploy!

**Result**: https://mybonzo-ai-chat.pages.dev

### ETAP 4: Blog Integration

```powershell
cd Q:\mybonzo\mybonzoAIblog\src\pages\eksperymenty\projekt-1
# Edit index.astro
```

Add iframe integration:

```astro
---
import Layout from '../../../layouts/Layout.astro';
---

<Layout 
    title="MyBonzo AI Chat" 
    description="Inteligentny asystent AI z wieloma modelami"
>
    <div class="container mx-auto px-4 py-8">
        <a href="/eksperymenty" class="text-blue-600 hover:underline mb-4 inline-block">
            ← Powrót do Laboratorium
        </a>

        <h1 class="text-4xl font-bold mb-6">🤖 MyBonzo AI Chat</h1>

        <div class="w-full h-[800px] border-2 rounded-lg shadow-lg overflow-hidden">
            <iframe 
                src="https://mybonzo-ai-chat.pages.dev"
                class="w-full h-full"
                title="MyBonzo AI Chat"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                loading="lazy"
            />
        </div>
    </div>
</Layout>
```

Commit & push:

```powershell
git add src/pages/eksperymenty/projekt-1/index.astro
git commit -m "Add mybonzo-ai-chat integration"
git push origin main
```

---

## 🔧 Configuration

### API Providers

Edit `src/utils/ai-providers.js` to add/remove providers:

```javascript
export const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    default: 'gpt-4o-mini'
  },
  anthropic: {
    name: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    default: 'claude-3-5-sonnet-20241022'
  }
};
```

### Role Presets

Customize in `src/components/ChatWidget.jsx`:

```javascript
const ROLE_PRESETS = [
  { id: "helpful", label: "Pomocny asystent", prompt: "..." },
  { id: "code", label: "Asystent programisty", prompt: "..." },
  // Add your own...
];
```

---

## 🎨 Styling

The component uses `blog-theme.css` for consistent styling with the main blog.

**Copy shared styles**:

```powershell
Copy-Item "Q:\mybonzo\mybonzoAIblog\src\pages\eksperymenty\_SHARED_ASSETS\styles\blog-theme.css" "src\styles\"
```

**Available CSS Classes**:
- `.blog-container` - Main container
- `.blog-heading` - Headings
- `.blog-card` - Cards
- `.blog-button` - Buttons
- `.blog-input` - Input fields
- Dark mode automatic

---

## 🔒 Security

### API Keys
- ✅ Never commit API keys to repository
- ✅ Use environment variables
- ✅ `.dev.vars` for local, Cloudflare ENV for production

### CORS
- ✅ Configured in Pages Functions
- ✅ Only allow your domains

### Rate Limiting
- ⚠️ Implement in Cloudflare Workers if needed
- ⚠️ Monitor API usage

---

## 📊 Cost Estimation

| Service | Monthly Cost |
|---------|--------------|
| Cloudflare Pages | $0 (Free tier) |
| OpenAI API | $5-15 (depends on usage) |
| Anthropic API | $0-10 (optional) |
| Google AI | $0 (free tier) |
| **TOTAL** | **~$5-25/month** |

---

## 🐛 Troubleshooting

### Build Fails
```powershell
# Clear cache and rebuild
rm -Recurse -Force node_modules, dist
npm install
npm run build
```

### API Errors
- Check environment variables in Cloudflare dashboard
- Verify API keys are valid
- Check browser console for errors

### Streaming Not Working
- Ensure fetch supports streaming
- Check Cloudflare Workers compatibility
- Try non-streaming mode

---

## 🔄 Updates & Maintenance

### Update Dependencies
```powershell
npm update
npm audit fix
```

### Sync Blog Theme
```powershell
Copy-Item "Q:\mybonzo\mybonzoAIblog\src\pages\eksperymenty\_SHARED_ASSETS\styles\blog-theme.css" "src\styles\"
git add src/styles/blog-theme.css
git commit -m "Update blog theme"
git push
```

---

## 📚 Documentation

- [Astro Docs](https://docs.astro.build)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com)

---

## ✅ Production Checklist

- [ ] Local development works
- [ ] All features tested
- [ ] API keys configured
- [ ] Build successful
- [ ] GitHub repository created
- [ ] Cloudflare Pages deployed
- [ ] Environment variables set
- [ ] Production URL working
- [ ] Blog integration added
- [ ] Documentation updated

---

## 🎉 Next Steps

1. ✅ Test locally: `npm run dev`
2. ✅ Deploy to Cloudflare: See ETAP 3
3. ✅ Integrate with blog: See ETAP 4
4. 🚀 Move to next component: `02-image-generator`

---

**Created**: November 2025  
**Version**: 2.0  
**Status**: Production Ready ✅
