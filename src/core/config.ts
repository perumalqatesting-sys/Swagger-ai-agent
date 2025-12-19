import defaultConfig from "../config/default";
import env from "./env";

export type AppConfig = {
  env: string;
  port: number;
  logLevel: string;
  llm: {
    provider: string;
    apiKey: string;
    defaultModel: string;
    maxTokens: number;
  };
  testgen: {
    outputDir: string;
  };
};

const config: AppConfig = {
  env: defaultConfig.env || env.getEnv("NODE_ENV", "development") || "development",
  port: defaultConfig.port || env.getEnvNumber("PORT", 3000) || 3000,
  logLevel: defaultConfig.logLevel || env.getEnv("LOG_LEVEL", "info") || "info",
  llm: {
    provider: env.getEnv("LLM_PROVIDER", defaultConfig.llm.provider) || "openai",
    apiKey: env.getEnv("LLM_API_KEY", defaultConfig.llm.apiKey) || "",
    defaultModel: env.getEnv("AGENT_DEFAULT_MODEL", defaultConfig.llm.defaultModel) || defaultConfig.llm.defaultModel,
    maxTokens: env.getEnvNumber("AGENT_MAX_TOKENS", defaultConfig.llm.maxTokens) || 1024
  },
  testgen: {
    outputDir: env.getEnv("TESTGEN_OUTPUT_DIR", defaultConfig.testgen.outputDir) || defaultConfig.testgen.outputDir
  }
};

export default config;
