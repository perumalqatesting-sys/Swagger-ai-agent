import { v4 as uuidv4 } from "uuid";
import AxiosClient from "../../infrastructure/http/AxiosClient";

async function executeOperation(operation: any, input?: any) {
  const id = uuidv4();
  const config = {
    method: operation.method.toLowerCase(),
    url: operation.path.startsWith("http") ? operation.path : `${operation.baseUrl || ""}${operation.path}`,
    data: input || operation.requestBody || {}
  };
  const res = await AxiosClient.request(config as any);
  return { id, status: res.status, data: res.data };
}

function filterOperations(allOps: any[], selection: any) {
  if (selection.mode === "single") {
    return allOps.filter((o) => o.operationId === selection.operationId || o.id === selection.operationId);
  }
  if (selection.mode === "tag") {
    return allOps.filter((o) => o.tags && selection.tags?.some((t: string) => o.tags.includes(t)));
  }
  return allOps;
}

async function executePlannedRun(runPlanRepo: any, plan: any) {
  plan.status = "running";
  for (const step of plan.steps) {
    step.status = "running";
    try {
      const out = await executeOperation(step.operation);
      step.status = "success";
      step.output = out;
    } catch (err: any) {
      step.status = "failed";
      plan.status = "failed";
      step.output = { error: err?.message };
      break;
    }
  }
  if (plan.status !== "failed") plan.status = "completed";
  await runPlanRepo.save(plan);
  return plan;
}

export default async function executeRun(runPlanRepo: any, specRepo: any, envRepo: any, request: any) {
  if (request.runId) {
    const existing = await runPlanRepo.get(request.runId);
    if (!existing) throw new Error(`Run plan ${request.runId} not found`);
    return executePlannedRun(runPlanRepo, existing);
  }

  const { specId, envName, selection } = request || {};
  if (!specId || !envName || !selection) {
    throw new Error("specId, envName, and selection are required to plan and run");
  }

  const spec = await specRepo.get(specId);
  if (!spec) throw new Error(`Spec with id ${specId} not found`);

  const envs = await envRepo.listBySpecId(specId);
  const env = envs.find((e: any) => e.name === envName);
  if (!env) throw new Error(`Environment \"${envName}\" not found for spec ${specId}`);

  const ops = filterOperations(spec.operations || [], selection).map((op: any) => ({
    ...op,
    baseUrl: env.baseUrl
  }));
  if (ops.length === 0) throw new Error("No operations match the selection");

  const steps = ops.map((op: any) => ({ stepId: uuidv4(), operation: op, status: "pending" }));
  const runId = uuidv4();
  const plan = { runId, specId, envName, steps, status: "pending", createdAt: new Date().toISOString() };
  await runPlanRepo.save(plan);

  return executePlannedRun(runPlanRepo, plan);
}
