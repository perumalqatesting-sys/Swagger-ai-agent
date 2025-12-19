import { Router } from "express";
import exportCtrl from "../controllers/testgenExport.controller";
import requireJwt from "../../core/middlewares/jwtAuth";

const router = Router();

// Protect export with admin JWT
router.post("/export", requireJwt('admin'), exportCtrl.exportTest);

export default router;
