import { Router } from 'express';
import executionCtrl from '../controllers/execution.controller';

const router = Router();

router.post('/plan', executionCtrl.planRunHandler);
router.get('/status/:runId', executionCtrl.getRunStatusHandler);
router.post('/retry/:runId', executionCtrl.retryFailedTestHandler);

export default router;




