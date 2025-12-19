import { Router } from "express";
import executionCtrl from "../controllers/execution.controller";

// Legacy /run alias routes mapping to execution controller
const router = Router();

// Plan a run
router.post("/plan", executionCtrl.planRunHandler);

// Execute (plan+run) or execute existing runId (if provided in body)
router.post("/execute", executionCtrl.executeRunHandler);

// Get run status
router.get("/status/:runId", executionCtrl.getRunStatusHandler);

// Retry failed tests
router.post("/retry/:runId", executionCtrl.retryFailedTestHandler);

export default router;
