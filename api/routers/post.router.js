import express from "express";
import {
  getPostByCategory,
  getListPost,
  getPostDetail,
  getCommentByPost,
  addComment,
  deleteComment,
  getPostDetailAdmin,
} from "../controllers/post.controller.js";
const router = express.Router();

router.get("/getPost/category/:category/:page", getPostByCategory);

router.get("/getPost/:page", getListPost);

router.get("/getPostDetail/:id", getPostDetail);

router.get("/postDetail/admin/:id", getPostDetailAdmin);

router.get("/comment/:id", getCommentByPost);

router.post("/comment/add", addComment);

router.delete("/comment/delete/:id", deleteComment);

export default router;
