import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

export const config = {
  groqApiKey: process.env.GROQ_API_KEY || '',
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};

export function validateConfig() {
  if (!config.groqApiKey) {
    throw new Error(
      'GROQ_API_KEY is not set. Add your Groq API key to the .env file.'
    );
  }
}
