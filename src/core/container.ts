import createLlmClient from "../infrastructure/llm/LlmClientFactory";
import InMemorySpecRepository from "../infrastructure/persistence/InMemorySpecRepository";
import InMemoryRunPlanRepository from "../infrastructure/persistence/InMemoryRunPlanRepository";
import InMemoryEnvironmentRepository from "../infrastructure/persistence/memory/EnvironmentRepository.memory";
import AxiosClient from "../infrastructure/http/AxiosClient";

const llmClient = createLlmClient();
const specRepository = new InMemorySpecRepository();
const runPlanRepository = new InMemoryRunPlanRepository();
const environmentRepository = new InMemoryEnvironmentRepository();
const httpClient = new AxiosClient();

export default {
  llmClient,
  specRepository,
  runPlanRepository,
  environmentRepository,
  httpClient
};
