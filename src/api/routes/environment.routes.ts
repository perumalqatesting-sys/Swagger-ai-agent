import { Router } from 'express';
import envCtrl from '../controllers/environment.controller';
import envValidator from '../validators/environment.validator';

const router = Router();

router.post('/', envValidator.validateCreateEnv, envCtrl.createEnv);
router.get('/', envCtrl.listEnv);
router.get('/:envId', envCtrl.getEnv);
router.put('/:envId', envValidator.validateUpdateEnv, envCtrl.updateEnv);
router.delete('/:envId', envCtrl.removeEnv);

export default router;
