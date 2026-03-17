import express from "express";
import authRoutes from "./auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

export default router;