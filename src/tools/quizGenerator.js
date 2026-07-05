import { generate } from '../agent/llm.js';
import { SYSTEM_PROMPT, QUIZ_PROMPT } from '../agent/prompts.js';

/**
 * Generate a quiz on a programming topic.
 *
 * @param {object} params
 * @param {string} params.topic   - Topic to quiz on (e.g. "JavaScript promises")
 * @param {string} [params.level] - "beginner" | "intermediate" | "advanced"
 * @param {number} [params.count] - Number of questions (default 5)
 * @returns {Promise<string>} Markdown-formatted quiz
 */
export async function generateQuiz({ topic, level = 'intermediate', count = 5 }) {
  if (!topic || !topic.trim()) {
    throw new Error('No topic provided for quiz generation.');
  }

  const safeCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
  const prompt = QUIZ_PROMPT(topic.trim(), level, safeCount);
  return generate(SYSTEM_PROMPT, prompt);
}
