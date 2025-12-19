import { Router } from "express";
import specRoutes from "./spec.routes";
import environmentRoutes from "./environment.routes";
import runRoutes from "./run.routes";
import executionRoutes from "./execution.routes";
import testgenRoutes from "./testgen.routes";
import adminRoutes from "./admin.routes";
import llmRoutes from "./llm.routes";
import testgenExportRoutes from "./testgen.export.routes";
import swaggerMcpRoutes from "./swaggerMcp.routes";

const router = Router();

router.use("/spec", specRoutes);
router.use("/environments", environmentRoutes);
router.use("/run", runRoutes);
router.use("/execution", executionRoutes);
router.use("/testgen", testgenRoutes);
router.use("/admin", adminRoutes);
router.use("/llm", llmRoutes);
router.use("/testgen/export", testgenExportRoutes);
router.use("/mcp/swagger", swaggerMcpRoutes);

export default router;
