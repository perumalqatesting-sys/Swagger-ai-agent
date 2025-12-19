import { Router } from 'express';
import swaggerMcpCtrl from '../controllers/swaggerMcp.controller';

const router = Router();

// MCP Tool endpoints - map HTTP calls to MCP tools
router.post('/list-operations', swaggerMcpCtrl.listOperationsHandler);
router.post('/plan-run', swaggerMcpCtrl.planApiRunHandler);
router.post('/execute-operation', swaggerMcpCtrl.executeOperationHandler);
router.post('/generate-tests', swaggerMcpCtrl.generateAxiosTestsHandler);

export default router;





