/* ── Coding Mentor Agent — Frontend App ─────── */

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

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
document.getElementById('runQuiz').addEventListener('click', async () => {
  const btn = document.getElementById('runQuiz');
  const result = document.getElementById('quizResult');
  const topic = document.getElementById('quizTopic').value.trim();
  if (!topic) { showError(result, 'Please enter a quiz topic.'); return; }

  disableBtn(btn);
  showLoading(result, 'Generating quiz...');
  try {
    const md = await callAPI('/api/quiz', {
      topic,
      level: document.getElementById('quizLevel').value,
      count: parseInt(document.getElementById('quizCount').value) || 5,
    });
    renderMarkdown(result, md);
  } catch (e) { showError(result, e.message); }
  finally { enableBtn(btn); }
});

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
