import express from "express";
import {
  register,
  login,
  refreshToken,
  profile,
  about,
  detail,
} from "../controllers/user.controller.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refreshToken", refreshToken);
router.get("/user/profile", profile);
router.put("/profile/about", about);
router.put("/profile/detail", detail);
export default router;
