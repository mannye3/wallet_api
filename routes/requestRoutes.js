import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { allRequest, sendRequest, getAllTransaction } from "../controllers/request.controller.js";
import { checkAuth } from "../controllers/auth.controller.js";

const router = express.Router();

// Transfer money from one account to another
router.post("/send-request", sendRequest, verifyToken, checkAuth);
// router.post("/deposit-fund", DepositFunds, verifyToken, checkAuth);
router.get("/all-requests", allRequest, verifyToken, checkAuth);
router.get("/requests", getAllTransaction, verifyToken);
// router.post("/verify-account", verifyAccount);



export default router;