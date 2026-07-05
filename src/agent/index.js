/**
 * Main agent orchestrator — routes requests to the appropriate tool.
 */
import { SYSTEM_PROMPT } from './prompts.js';
import { reviewCode } from '../tools/codeReview.js';
import { explainConcept } from '../tools/conceptExplainer.js';
import { suggestLearningPath } from '../tools/learningPath.js';
import { generateQuiz } from '../tools/quizGenerator.js';
import { generateChallenge } from '../tools/challengeGenerator.js';
import { chat } from './llm.js';

export const AGENT_TOOLS = {
  review: reviewCode,
  explain: explainConcept,
  path: suggestLearningPath,
  quiz: generateQuiz,
  challenge: generateChallenge,
};

/**
 * Free-form conversational chat with the mentor.
 * Maintains a simple in-memory history per session.
 */
export class MentorSession {
  constructor() {
    this.history = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];
  }

  async ask(userMessage) {
    this.history.push({ role: 'user', content: userMessage });
    const response = await chat(this.history);
    this.history.push({ role: 'assistant', content: response });
    return response;
  }

  reset() {
    this.history = [{ role: 'system', content: SYSTEM_PROMPT }];
  }

  getHistory() {
    // Return history without the system message
    return this.history.slice(1);
  }
}
