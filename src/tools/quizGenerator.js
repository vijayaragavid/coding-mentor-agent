import { generate } from '../agent/llm.js';
import { SYSTEM_PROMPT, QUIZ_PROMPT } from '../agent/prompts.js';

/**
 * Generate a quiz on a programming topic.
 * Returns a parsed JSON array of question objects.
 *
 * @param {object} params
 * @param {string} params.topic   - Topic to quiz on (e.g. "JavaScript promises")
 * @param {string} [params.level] - "beginner" | "intermediate" | "advanced"
 * @param {number} [params.count] - Number of questions (default 5)
 * @returns {Promise<Array>} Array of { question, options, answer, explanation }
 */
export async function generateQuiz({ topic, level = 'intermediate', count = 5 }) {
  if (!topic || !topic.trim()) {
    throw new Error('No topic provided for quiz generation.');
  }

  const safeCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
  const prompt = QUIZ_PROMPT(topic.trim(), level, safeCount);
  const raw = await generate(SYSTEM_PROMPT, prompt);

  // Strip any accidental markdown fences the model might add
  const cleaned = raw.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const questions = JSON.parse(cleaned);
    if (!Array.isArray(questions)) throw new Error('Response is not an array');
    return questions;
  } catch {
    throw new Error('Failed to parse quiz questions. Please try again.');
  }
}
