import { LLMClient, LLMResponse } from "./LLMClient.interface";
import config from "../../config/default";

export class OpenAIClient implements LLMClient {
  apiKey: string;
  private client: any | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.llm.apiKey || "";
    if (this.apiKey) {
      try {
        // Dynamically require to avoid hard dependency in environments without package installed
        // but package.json now includes `openai` and will be installed.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { OpenAI } = require("openai");
        this.client = new OpenAI({ apiKey: this.apiKey });
      } catch (e) {
        this.client = null;
      }
    }
  }

  async generate(prompt: string, options?: { model?: string; maxTokens?: number }): Promise<LLMResponse> {
    // If no API key or client, return a deterministic mock for offline development
    if (!this.client) {
      return { text: `MOCK_RESPONSE: processed prompt length=${prompt.length}` };
    }

    // Call OpenAI's completion/chat API. Use chat completions if available, otherwise fallback.
    const model = options?.model || config.llm.defaultModel;
    const maxTokens = options?.maxTokens || config.llm.maxTokens;

    // Use chat completions when model name indicates chat-capable, otherwise use completions.
    try {
      if (model.toLowerCase().startsWith("gpt-")) {
        const resp = await this.client.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
        });
        const text = resp.choices?.[0]?.message?.content ?? resp.choices?.[0]?.text ?? "";
        return { text, raw: resp };
      }

      const resp = await this.client.responses.create({
        model,
        input: prompt,
        max_tokens: maxTokens,
      });
      const text = resp.output?.[0]?.content?.map((c: any) => c?.text || "").join("") || resp.output_text || "";
      return { text, raw: resp };
    } catch (err: any) {
      // On error, return a helpful message wrapped in an LLMResponse
      return { text: `LLM_ERROR: ${err?.message || String(err)}`, raw: err };
    }
  }
}

export default OpenAIClient;
