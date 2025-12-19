import { Router } from "express";
import adminCtrl from "../controllers/admin.controller";

const router = Router();

router.post("/mint", adminCtrl.mintToken);

export default router;
