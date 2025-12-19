import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || "info",
  llm: {
    provider: process.env.LLM_PROVIDER || "openai",
    apiKey: process.env.LLM_API_KEY || "",
    defaultModel: process.env.AGENT_DEFAULT_MODEL || "gpt-4o-mini",
    maxTokens: Number(process.env.AGENT_MAX_TOKENS || 1024)
  },
  testgen: {
    outputDir: process.env.TESTGEN_OUTPUT_DIR || "./generated-tests"
  }
};
