import { Router } from "express";
import specCtrl from "../controllers/spec.controller";
import specValidator from "../validators/spec.validator";

const router = Router();

router.post("/import", specValidator.requireSource, specCtrl.importSpec);
router.post("/validate", specValidator.requireSpecIdOrDocument, specCtrl.validateSpec);
router.get("/:specId", specCtrl.getSpec);
router.get("/:specId/operations", specCtrl.getOperations);
router.get("/:specId/tags", specCtrl.getTags);
router.get("/:specId/environments", specCtrl.getSpecEnvironments);

export default router;

