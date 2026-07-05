/**
 * Coding Mentor Agent — Express Web Server
 * Serves the web UI and exposes a REST + SSE API.
 */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { config, validateConfig } from './config.js';
import { reviewCode } from './tools/codeReview.js';
import { explainConcept } from './tools/conceptExplainer.js';
import { suggestLearningPath } from './tools/learningPath.js';
import { generateQuiz } from './tools/quizGenerator.js';
import { generateChallenge } from './tools/challengeGenerator.js';
import { MentorSession } from './agent/index.js';
import { stream } from './agent/llm.js';
import { SYSTEM_PROMPT } from './agent/prompts.js';

validateConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(join(__dirname, '../public')));

// In-memory session store (keyed by sessionId)
const sessions = new Map();

function getSession(id) {
  if (!sessions.has(id)) sessions.set(id, new MentorSession());
  return sessions.get(id);
}

// ─── Helper ─────────────────────────────────────────────────────────────────
function handleError(res, err) {
  const message = err?.message || 'Internal server error';
  console.error('[ERROR]', message);
  res.status(500).json({ error: message });
}

// ─── API Routes ──────────────────────────────────────────────────────────────

/** POST /api/review */
app.post('/api/review', async (req, res) => {
  try {
    const { code, language = 'javascript', level = 'intermediate' } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });
    const result = await reviewCode({ code, language, level });
    res.json({ result });
  } catch (err) { handleError(res, err); }
});

/** POST /api/explain */
app.post('/api/explain', async (req, res) => {
  try {
    const { concept, level = 'intermediate', language = 'javascript' } = req.body;
    if (!concept) return res.status(400).json({ error: 'concept is required' });
    const result = await explainConcept({ concept, level, language });
    res.json({ result });
  } catch (err) { handleError(res, err); }
});

/** POST /api/path */
app.post('/api/path', async (req, res) => {
  try {
    const { goal, currentSkills = 'basic programming', timeframe = '3 months' } = req.body;
    if (!goal) return res.status(400).json({ error: 'goal is required' });
    const result = await suggestLearningPath({ goal, currentSkills, timeframe });
    res.json({ result });
  } catch (err) { handleError(res, err); }
});

/** POST /api/quiz */
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic, level = 'intermediate', count = 5 } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const result = await generateQuiz({ topic, level, count });
    res.json({ result });
  } catch (err) { handleError(res, err); }
});

/** POST /api/challenge */
app.post('/api/challenge', async (req, res) => {
  try {
    const { topic, level = 'intermediate', language = 'javascript' } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const result = await generateChallenge({ topic, level, language });
    res.json({ result });
  } catch (err) { handleError(res, err); }
});

/**
 * POST /api/chat  — conversational chat
 * Body: { sessionId, message }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId = 'default', message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const session = getSession(sessionId);
    const result = await session.ask(message);
    res.json({ result, sessionId });
  } catch (err) { handleError(res, err); }
});

/**
 * GET /api/chat/stream?sessionId=&message=  — streaming chat via SSE
 */
app.get('/api/chat/stream', async (req, res) => {
  const { sessionId = 'default', message } = req.query;
  if (!message) return res.status(400).json({ error: 'message is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const session = getSession(sessionId);
  session.history.push({ role: 'user', content: message });

  // Build prompt from history
  const historyText = session.getHistory()
    .map(m => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content}`)
    .join('\n\n');

  let fullResponse = '';
  try {
    fullResponse = await stream(SYSTEM_PROMPT, historyText, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });
    session.history.push({ role: 'assistant', content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

/** DELETE /api/chat/:sessionId — reset a session */
app.delete('/api/chat/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
  res.json({ ok: true });
});

/** GET /api/health */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: config.model, timestamp: new Date().toISOString() });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🎓 Coding Mentor Agent running at http://localhost:${config.port}\n`);
});

export default app;
