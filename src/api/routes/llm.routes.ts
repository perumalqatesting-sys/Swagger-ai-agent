import { Router } from 'express';
import llmCtrl from '../controllers/llm.controller';
import llmValidator from '../validators/llm.validator';

const router = Router();

router.post('/build-payload', llmValidator.validateBuildPayload, llmCtrl.buildPayloadHandler);

export default router;
