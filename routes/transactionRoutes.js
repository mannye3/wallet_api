import express from "express";
import { DepositFunds, getAllTransactions, transfer, verifyAccount } from "../controllers/transaction.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkAuth, checkAuth2 } from "../controllers/auth.controller.js";

const router = express.Router();

// Transfer money from one account to another
router.post("/transfer-fund", transfer, verifyToken, checkAuth);
router.post("/deposit-fund", DepositFunds, verifyToken, checkAuth);
//router.get("/all-transactions", getAllTransactions, verifyToken);
router.get("/user-transactions", verifyToken, getAllTransactions)
router.post("/verify-account", verifyAccount);



export default router;