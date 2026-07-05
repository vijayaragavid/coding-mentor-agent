import { generate } from '../agent/llm.js';
import { SYSTEM_PROMPT, LEARNING_PATH_PROMPT } from '../agent/prompts.js';

/**
 * Generate a personalised learning path toward a specific goal.
 *
 * @param {object} params
 * @param {string} params.goal          - What the learner wants to achieve
 * @param {string} [params.currentSkills] - What they already know
 * @param {string} [params.timeframe]   - Available time (e.g. "3 months", "6 weeks")
 * @returns {Promise<string>} Markdown learning path
 */
export async function suggestLearningPath({
  goal,
  currentSkills = 'basic programming knowledge',
  timeframe = '3 months',
}) {
  if (!goal || !goal.trim()) {
    throw new Error('No learning goal provided.');
  }

  const prompt = LEARNING_PATH_PROMPT(goal.trim(), currentSkills, timeframe);
  return generate(SYSTEM_PROMPT, prompt);
}
