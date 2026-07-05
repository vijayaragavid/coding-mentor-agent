import { generate } from '../agent/llm.js';
import { SYSTEM_PROMPT, CHALLENGE_PROMPT } from '../agent/prompts.js';

/**
 * Generate a hands-on coding challenge.
 *
 * @param {object} params
 * @param {string} params.topic    - Topic for the challenge (e.g. "recursion", "REST APIs")
 * @param {string} [params.level]  - "beginner" | "intermediate" | "advanced"
 * @param {string} [params.language] - Target language for the challenge
 * @returns {Promise<string>} Markdown challenge with hints and solution
 */
export async function generateChallenge({ topic, level = 'intermediate', language = 'javascript' }) {
  if (!topic || !topic.trim()) {
    throw new Error('No topic provided for challenge generation.');
  }

  const prompt = CHALLENGE_PROMPT(topic.trim(), level, language);
  return generate(SYSTEM_PROMPT, prompt);
}
