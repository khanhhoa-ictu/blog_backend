import express from "express";
import {
  register,
  login,
  refreshToken,
  profile,
} from "../controllers/user.controller.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refreshToken", refreshToken);
router.get("/user/profile", profile);

export default router;
