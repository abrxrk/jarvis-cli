import express from "express";
import { login, logout } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/auth/device/start", login);
router.post("/auth/device/poll", logout);

export default router;