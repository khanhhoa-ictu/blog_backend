import express from "express";
import {
  addPost,
  getPostManager,
  deletePost,
  getListUser,
  deleteUser,
} from "../controllers/manager.controller.js";
const router = express.Router();

router.post("/manager/addPost", addPost);
router.get("/manager/getPost", getPostManager);
router.delete("/manager/delete/:id", deletePost);
router.get("/manager/user", getListUser);
router.delete("/manager/user/:id", deleteUser);

export default router;
