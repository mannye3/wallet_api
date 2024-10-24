import express from "express";
import { getAdminDashboard } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { adminCheck, authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Define routes related to admin
router.get('/dashboard', verifyToken, adminCheck, authorizeRoles('admin'), getAdminDashboard);

// Use `export default` instead of `module.exports`
export default router;
