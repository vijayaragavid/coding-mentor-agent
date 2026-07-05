import { generate } from '../agent/llm.js';
import { SYSTEM_PROMPT, EXPLAIN_CONCEPT_PROMPT } from '../agent/prompts.js';

/**
 * Explain a programming concept at the learner's level with examples.
 *
 * @param {object} params
 * @param {string} params.concept    - Concept to explain (e.g. "closures", "async/await")
 * @param {string} [params.level]    - "beginner" | "intermediate" | "advanced"
 * @param {string} [params.language] - Language for code examples
 * @returns {Promise<string>} Markdown explanation
 */
export async function explainConcept({ concept, level = 'intermediate', language = 'javascript' }) {
  if (!concept || !concept.trim()) {
    throw new Error('No concept provided to explain.');
  }

  const prompt = EXPLAIN_CONCEPT_PROMPT(concept.trim(), level, language);
  return generate(SYSTEM_PROMPT, prompt);
}
