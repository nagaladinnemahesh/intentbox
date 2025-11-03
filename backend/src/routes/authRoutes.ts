import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import {googleLogin, googleCallback} from "../controllers/googleAuthController.js";
import {protect} from "../middleware/authMiddleware.js";
import {getCurrentUser} from "../controllers/userController.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

router.get('/me', protect, getCurrentUser)
export default router;
