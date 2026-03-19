# AI Integration (MVP)

JARVIS CLI uses a local first AI approach where users bring their own API key and interact directly with the model from the CLI.

## 🔑 API Key & Model Setup

After login, users configure AI with:

```bash
jarvis model     # select model (Gemini for now)
jarvis status    # check AI status
jarvis generate  # generate code
```

- API keys are stored locally on the user's machine
- No AI requests are routed through the backend
- Each user controls their own usage and cost

## ⚙️ Architecture

**CLI → AI SDK → Gemini API**

- AI calls are handled directly in the CLI
- No backend dependency for AI (auth remains server-based)
- Uses Vercel AI SDK for model interaction

## 🚀 Code Generation (Current Capability)

JARVIS currently supports code generation only:

```bash
jarvis generate "create an express server"
```

### Features:

- Generate code from natural language prompts
- Optionally write output directly to files
- Preview output in terminal

## 🧠 Design Decisions

- ✅ AI logic is kept inside generate.js for MVP simplicity
- ✅ Structured functions are used internally for easy future refactoring
- 🔜 Will be moved to a dedicated service layer as features grow

## ⚠️ Current Limitations

- No file reading or codebase understanding yet
- No multi-file generation
- No agent/tool-calling capabilities

## 🔮 Future Enhancements

- Codebase-aware AI (RAG)
- Multi-file project generation
- Agentic workflows (edit, fix, refactor)
- Support for multiple models/providers
