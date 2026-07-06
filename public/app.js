/* ── Coding Mentor Agent — Frontend App ─────── */

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

// ── Dark / Light Mode Toggle ──────────────────
const themeToggle = document.getElementById('themeToggle');
const hljsTheme = document.getElementById('hljs-theme');
const DARK_HLJS  = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
const LIGHT_HLJS = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';

function applyTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️';
    hljsTheme.href = LIGHT_HLJS;
  } else {
    document.body.classList.remove('light');
    themeToggle.textContent = '🌙';
    hljsTheme.href = DARK_HLJS;
  }
}

// Load saved preference, default dark
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.contains('light');
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

// ── Tab switching ─────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Helpers ───────────────────────────────────
function renderMarkdown(el, md) {
  el.innerHTML = `<div class="md-content">${marked.parse(md)}</div>`;
  el.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
  el.classList.add('visible');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showLoading(el, msg = 'Thinking...') {
  el.innerHTML = `<div class="loading"><div class="spinner"></div><span>${msg}</span></div>`;
  el.classList.add('visible');
}

function showError(el, msg) {
  el.innerHTML = `<div class="md-content" style="color:#ff6b6b">⚠️ ${msg}</div>`;
  el.classList.add('visible');
}

async function callAPI(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data.result;
}

function disableBtn(btn, label = 'Working...') {
  btn.disabled = true;
  btn._orig = btn.textContent;
  btn.textContent = label;
}
function enableBtn(btn) {
  btn.disabled = false;
  btn.textContent = btn._orig;
}

// ── Code Review ───────────────────────────────
document.getElementById('runReview').addEventListener('click', async () => {
  const btn = document.getElementById('runReview');
  const result = document.getElementById('reviewResult');
  const code = document.getElementById('reviewCode').value.trim();
  if (!code) { showError(result, 'Please paste some code first.'); return; }

  disableBtn(btn);
  showLoading(result, 'Reviewing your code...');
  try {
    const md = await callAPI('/api/review', {
      code,
      language: document.getElementById('reviewLang').value,
      level: document.getElementById('reviewLevel').value,
    });
    renderMarkdown(result, md);
  } catch (e) { showError(result, e.message); }
  finally { enableBtn(btn); }
});

// ── Explain ───────────────────────────────────
document.getElementById('runExplain').addEventListener('click', async () => {
  const btn = document.getElementById('runExplain');
  const result = document.getElementById('explainResult');
  const concept = document.getElementById('explainConcept').value.trim();
  if (!concept) { showError(result, 'Please enter a concept to explain.'); return; }

  disableBtn(btn);
  showLoading(result, `Explaining "${concept}"...`);
  try {
    const md = await callAPI('/api/explain', {
      concept,
      level: document.getElementById('explainLevel').value,
      language: document.getElementById('explainLang').value,
    });
    renderMarkdown(result, md);
  } catch (e) { showError(result, e.message); }
  finally { enableBtn(btn); }
});

// ── Learning Path ─────────────────────────────
document.getElementById('runPath').addEventListener('click', async () => {
  const btn = document.getElementById('runPath');
  const result = document.getElementById('pathResult');
  const goal = document.getElementById('pathGoal').value.trim();
  if (!goal) { showError(result, 'Please enter a learning goal.'); return; }

  disableBtn(btn, 'Generating...');
  showLoading(result, 'Building your learning path...');
  try {
    const md = await callAPI('/api/path', {
      goal,
      currentSkills: document.getElementById('pathSkills').value,
      timeframe: document.getElementById('pathTime').value,
    });
    renderMarkdown(result, md);
  } catch (e) { showError(result, e.message); }
  finally { enableBtn(btn); }
});

// ── Quiz ──────────────────────────────────────
let quizState = { questions: [], userAnswers: [], submitted: false };

document.getElementById('runQuiz').addEventListener('click', async () => {
  const btn = document.getElementById('runQuiz');
  const result = document.getElementById('quizResult');
  const topic = document.getElementById('quizTopic').value.trim();
  if (!topic) { showError(result, 'Please enter a quiz topic.'); return; }

  disableBtn(btn, 'Generating...');
  showLoading(result, 'Building your quiz...');

  try {
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        level: document.getElementById('quizLevel').value,
        count: parseInt(document.getElementById('quizCount').value) || 5,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API error');

    quizState = { questions: data.questions, userAnswers: new Array(data.questions.length).fill(null), submitted: false };
    renderQuiz(result, topic);
  } catch (e) {
    showError(result, e.message);
  } finally {
    enableBtn(btn);
  }
});

function renderQuiz(container, topic) {
  const { questions } = quizState;
  const letters = ['A', 'B', 'C', 'D'];

  let html = `<div class="quiz-wrapper">
    <div class="quiz-header">
      <span class="quiz-title">🧠 ${topic} Quiz</span>
      <span class="quiz-count">${questions.length} Questions</span>
    </div>
    <div class="quiz-questions">`;

  questions.forEach((q, qi) => {
    html += `<div class="quiz-question" id="qq-${qi}">
      <div class="question-text"><span class="q-num">Q${qi + 1}.</span> ${escapeHtml(q.question)}</div>
      <div class="options-grid">`;
    q.options.forEach((opt, oi) => {
      html += `<button class="option-btn" data-qi="${qi}" data-oi="${oi}" onclick="selectOption(${qi},${oi})">
        <span class="opt-letter">${letters[oi]}</span>
        <span class="opt-text">${escapeHtml(opt)}</span>
      </button>`;
    });
    html += `</div></div>`;
  });

  html += `</div>
    <div class="quiz-footer">
      <div class="quiz-progress" id="quizProgress">0 / ${questions.length} answered</div>
      <button class="btn-primary" id="submitQuizBtn" onclick="submitQuiz()" disabled>Submit Quiz →</button>
    </div>
  </div>`;

  container.innerHTML = html;
  container.classList.add('visible');
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.selectOption = function(qi, oi) {
  if (quizState.submitted) return;
  quizState.userAnswers[qi] = oi;

  // Update option button styles for this question
  document.querySelectorAll(`[data-qi="${qi}"]`).forEach(btn => {
    btn.classList.remove('selected');
  });
  const chosen = document.querySelector(`[data-qi="${qi}"][data-oi="${oi}"]`);
  if (chosen) chosen.classList.add('selected');

  // Update progress
  const answered = quizState.userAnswers.filter(a => a !== null).length;
  const prog = document.getElementById('quizProgress');
  if (prog) prog.textContent = `${answered} / ${quizState.questions.length} answered`;

  // Enable submit when all answered
  const submitBtn = document.getElementById('submitQuizBtn');
  if (submitBtn) submitBtn.disabled = answered < quizState.questions.length;
};

window.submitQuiz = function() {
  quizState.submitted = true;
  const { questions, userAnswers } = quizState;
  const letters = ['A', 'B', 'C', 'D'];

  let correct = 0;

  questions.forEach((q, qi) => {
    const userAns = userAnswers[qi];
    const isCorrect = userAns === q.answer;
    if (isCorrect) correct++;

    const qEl = document.getElementById(`qq-${qi}`);
    if (!qEl) return;

    // Style each option
    qEl.querySelectorAll('.option-btn').forEach(btn => {
      const oi = parseInt(btn.dataset.oi);
      btn.disabled = true;
      if (oi === q.answer) {
        btn.classList.add('correct');
      } else if (oi === userAns && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // Add explanation
    const expEl = document.createElement('div');
    expEl.className = `quiz-explanation ${isCorrect ? 'exp-correct' : 'exp-wrong'}`;
    expEl.innerHTML = `<span>${isCorrect ? '✅ Correct!' : `❌ Wrong — correct answer: <strong>${letters[q.answer]}) ${escapeHtml(q.options[q.answer])}</strong>`}</span>
      <p>${escapeHtml(q.explanation)}</p>`;
    qEl.appendChild(expEl);
  });

  // Score summary
  const pct = Math.round((correct / questions.length) * 100);
  const grade = pct >= 90 ? '🏆 Excellent!' : pct >= 70 ? '👍 Good job!' : pct >= 50 ? '📚 Keep practicing!' : '💪 Keep going!';
  const scoreColor = pct >= 70 ? '#00d4aa' : pct >= 50 ? '#f0a500' : '#ff6b6b';

  const footer = document.querySelector('.quiz-footer');
  if (footer) {
    footer.innerHTML = `<div class="score-card">
      <div class="score-circle" style="--score-color:${scoreColor}">
        <span class="score-pct">${pct}%</span>
        <span class="score-label">Score</span>
      </div>
      <div class="score-details">
        <div class="score-grade">${grade}</div>
        <div class="score-breakdown">${correct} correct out of ${questions.length} questions</div>
        <button class="btn-primary" style="margin-top:12px" onclick="document.getElementById('runQuiz').click()">Try Again →</button>
      </div>
    </div>`;
  }
};

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Challenge ─────────────────────────────────
document.getElementById('runChallenge').addEventListener('click', async () => {
  const btn = document.getElementById('runChallenge');
  const result = document.getElementById('challengeResult');
  const topic = document.getElementById('challengeTopic').value.trim();
  if (!topic) { showError(result, 'Please enter a challenge topic.'); return; }

  disableBtn(btn);
  showLoading(result, 'Creating your challenge...');
  try {
    const md = await callAPI('/api/challenge', {
      topic,
      level: document.getElementById('challengeLevel').value,
      language: document.getElementById('challengeLang').value,
    });
    renderMarkdown(result, md);
  } catch (e) { showError(result, e.message); }
  finally { enableBtn(btn); }
});

// ── Chat ──────────────────────────────────────
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendChat');
const SESSION_ID = 'web-' + Math.random().toString(36).slice(2);

function appendMsg(role, content, isMarkdown = false) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  const avatar = role === 'user' ? '👤' : '🎓';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (isMarkdown) {
    bubble.innerHTML = `<div class="md-content">${marked.parse(content)}</div>`;
    bubble.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
  } else {
    bubble.textContent = content;
  }
  div.innerHTML = `<div class="avatar">${avatar}</div>`;
  div.appendChild(bubble);
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg mentor';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="avatar">🎓</div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
  document.getElementById('typingIndicator')?.remove();
}

async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';
  appendMsg('user', msg, false);
  sendBtn.disabled = true;
  appendTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, message: msg }),
    });
    const data = await res.json();
    removeTyping();
    if (!res.ok) throw new Error(data.error || 'API error');
    appendMsg('mentor', data.result, true);
  } catch (e) {
    removeTyping();
    appendMsg('mentor', `⚠️ Error: ${e.message}`, false);
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// Reset chat
document.getElementById('resetChat').addEventListener('click', async () => {
  await fetch(`/api/chat/${SESSION_ID}`, { method: 'DELETE' });
  chatWindow.innerHTML = `
    <div class="chat-msg mentor">
      <div class="avatar">🎓</div>
      <div class="bubble">
        <p>Conversation reset. What would you like to learn today?</p>
      </div>
    </div>`;
});

// Enter key support on text inputs — submit on Enter
['explainConcept', 'pathGoal', 'quizTopic', 'challengeTopic'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const btnMap = {
          explainConcept: 'runExplain',
          pathGoal: 'runPath',
          quizTopic: 'runQuiz',
          challengeTopic: 'runChallenge',
        };
        document.getElementById(btnMap[id])?.click();
      }
    });
  }
});
