import config from "../../config/default";
import OpenAIClient from "./OpenAIClient";
import { LLMClient } from "./LLMClient.interface";

export function createLlmClient(): LLMClient {
  const provider = config.llm.provider;
  if (provider === "openai") {
    return new OpenAIClient(config.llm.apiKey);
  }
  // Add other providers here
  return new OpenAIClient(config.llm.apiKey);
}

export default createLlmClient;
