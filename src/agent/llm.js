import { createGroq } from '@ai-sdk/groq';
import { generateText, streamText } from 'ai';
import { config } from '../config.js';

let groqClient = null;

function getClient() {
  if (!groqClient) {
    groqClient = createGroq({ apiKey: config.groqApiKey });
  }
  return groqClient;
}

/**
 * Generate a complete text response (non-streaming).
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
export async function generate(systemPrompt, userPrompt) {
  const groq = getClient();
  const { text } = await generateText({
    model: groq(config.model),
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });
  return text;
}

/**
 * Stream a text response, calling onChunk for each delta.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {(chunk: string) => void} onChunk
 * @returns {Promise<string>} full accumulated text
 */
export async function stream(systemPrompt, userPrompt, onChunk) {
  const groq = getClient();
  const result = streamText({
    model: groq(config.model),
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });

  let fullText = '';
  for await (const delta of (await result).textStream) {
    fullText += delta;
    if (onChunk) onChunk(delta);
  }
  return fullText;
}

/**
 * Multi-turn conversation support.
 * Separates the system message from the conversation history,
 * as the AI SDK requires system prompt in its own field.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
export async function chat(messages) {
  const groq = getClient();

  // Split system message from conversation turns
  const systemMsg = messages.find(m => m.role === 'system');
  const conversationMsgs = messages.filter(m => m.role !== 'system');

  const { text } = await generateText({
    model: groq(config.model),
    system: systemMsg?.content,
    messages: conversationMsgs,
    maxTokens: 4096,
    temperature: 0.7,
  });
  return text;
}
