import { Router } from 'express';
import testgenCtrl from '../controllers/testgen.controller';
import testgenValidator from '../validators/testgen.validator';

const router = Router();

router.post('/generate-axios-tests', testgenValidator.validateGenerateAxiosTests, testgenCtrl.generateAxiosTestsHandler);
router.get('/spec/:specId/preview', testgenCtrl.previewTestSuiteHandler);

export default router;
