import { generate } from '../agent/llm.js';
import { SYSTEM_PROMPT, CODE_REVIEW_PROMPT } from '../agent/prompts.js';

/**
 * Review a code snippet and return structured mentor feedback.
 *
 * @param {object} params
 * @param {string} params.code       - The source code to review
 * @param {string} params.language   - Programming language (e.g. "javascript")
 * @param {string} [params.level]    - Learner level: "beginner" | "intermediate" | "advanced"
 * @returns {Promise<string>} Markdown-formatted review
 */
export async function reviewCode({ code, language = 'javascript', level = 'intermediate' }) {
  if (!code || !code.trim()) {
    throw new Error('No code provided for review.');
  }

  const prompt = CODE_REVIEW_PROMPT(code.trim(), language, level);
  return generate(SYSTEM_PROMPT, prompt);
}
