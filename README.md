# 🎓 Coding Mentor Agent

An AI-powered coding mentor that helps you grow as a developer. Review your code, learn concepts, get a personalised learning path, take quizzes, and tackle coding challenges — all through a sleek web UI or CLI.

---

## Features

| Tool | What it does |
|---|---|
| 💬 **Chat** | Free-form conversation with your AI mentor |
| 🔍 **Code Review** | Paste code and get structured, educational feedback |
| 📖 **Explain** | Deep-dive explanations of any programming concept |
| 🗺️ **Learning Path** | Personalised roadmap toward your dev goals |
| 🧠 **Quiz** | Test your knowledge on any topic |
| ⚡ **Challenge** | Hands-on coding challenges with hints & solutions |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- An OpenAI API key → https://platform.openai.com/api-keys

### 2. Install
```bash
npm install
```

### 3. Configure
```bash
# Copy the example env file
copy .env.example .env
```
Then open `.env` and set your API key:
```
OPENAI_API_KEY=sk-...your-key-here...
OPENAI_MODEL=gpt-4o-mini   # or gpt-4o for best results
```

### 4. Run

**Web UI** (recommended):
```bash
npm run web
```
Then open http://localhost:3000

**Interactive CLI**:
```bash
npm run cli
```

---

## CLI Commands

```bash
# Interactive chat (default)
node src/cli.js

# Review a file
node src/cli.js review --file mycode.js --language javascript --level intermediate

# Explain a concept
node src/cli.js explain "closures" --language python --level beginner

# Get a learning path
node src/cli.js path "become a backend developer" --skills "basic Python" --time "3 months"

# Take a quiz
node src/cli.js quiz "SQL joins" --level intermediate --count 5

# Get a coding challenge
node src/cli.js challenge "recursion" --language javascript --level advanced
```

---

## API Endpoints

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/review` | `{ code, language, level }` |
| POST | `/api/explain` | `{ concept, level, language }` |
| POST | `/api/path` | `{ goal, currentSkills, timeframe }` |
| POST | `/api/quiz` | `{ topic, level, count }` |
| POST | `/api/challenge` | `{ topic, level, language }` |
| POST | `/api/chat` | `{ sessionId, message }` |
| GET | `/api/chat/stream` | `?sessionId=&message=` (SSE) |
| GET | `/api/health` | — |

---

## Project Structure

```
coding-mentor-agent/
├── src/
│   ├── agent/
│   │   ├── index.js       # MentorSession class (multi-turn chat)
│   │   ├── llm.js         # OpenAI wrapper (generate / stream / chat)
│   │   └── prompts.js     # All system & tool prompts
│   ├── tools/
│   │   ├── codeReview.js
│   │   ├── conceptExplainer.js
│   │   ├── learningPath.js
│   │   ├── quizGenerator.js
│   │   └── challengeGenerator.js
│   ├── config.js          # Env config & validation
│   ├── cli.js             # CLI interface (commander + inquirer)
│   └── server.js          # Express web server
├── public/
│   ├── index.html         # Web UI
│   ├── style.css          # Dark theme styles
│   └── app.js             # Frontend JavaScript
├── .env.example
└── package.json
```

---

## Model Options

| Model | Speed | Quality | Cost |
|---|---|---|---|
| `gpt-4o-mini` | Fast | Good | Low |
| `gpt-4o` | Medium | Excellent | Higher |

Set `OPENAI_MODEL` in your `.env` to switch.

Live Deploy Link : https://coding-mentor-agent.onrender.com
