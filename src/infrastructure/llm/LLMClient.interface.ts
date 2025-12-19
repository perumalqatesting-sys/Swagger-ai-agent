export interface LLMResponse {
  text: string;
  raw?: any;
}

export interface LLMClient {
  generate(prompt: string, options?: { model?: string; maxTokens?: number }): Promise<LLMResponse>;
}
