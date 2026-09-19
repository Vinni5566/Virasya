import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-3.8-flash',
});

export const RESILIENT_MODELS = [
  'googleai/gemini-2.5-flash',
  'googleai/gemini-2.0-flash',
  'googleai/gemini-1.5-flash',
  'googleai/gemini-3.8-flash',
  'googleai/gemini-3.6-flash',
  'googleai/gemini-flash-latest',
] as const;

/**
 * Executes a Genkit prompt function with automatic failover and retry logic.
 * Protects against transient 503 (high demand / service unavailable), 429 (rate limit / quota),
 * and network hiccups by retrying with backoff and cascading to available models.
 */
export async function executePromptWithFailover<TInput, TOutput>(
  promptFn: (input: TInput, options?: any) => Promise<{ output?: TOutput | null }>,
  input: TInput,
  options?: any
): Promise<TOutput> {
  let lastError: any = null;

  for (let i = 0; i < RESILIENT_MODELS.length; i++) {
    const model = RESILIENT_MODELS[i];
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await promptFn(input, { ...options, model });
        if (response && response.output !== undefined && response.output !== null) {
          return response.output;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isQuotaExhausted =
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota') ||
          msg.includes('exceeded your current quota') ||
          msg.includes('rate-limit');

        if (isQuotaExhausted) {
          console.warn(`[Genkit Failover] Model ${model} encountered quota limit, falling back immediately: ${msg.slice(0, 100)}`);
          break; // Don't retry same model on quota limits
        }

        const isTransient =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('429') ||
          msg.includes('ECONNRESET') ||
          msg.includes('ETIMEDOUT');

        if (isTransient && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }

        console.warn(
          `[Genkit Resilient Failover] Model ${model} failed (attempt ${attempt}): ${msg.slice(0, 120)}. Trying next candidate model...`
        );
        break;
      }
    }
  }

  throw lastError || new Error('All candidate models failed to produce an output');
}
