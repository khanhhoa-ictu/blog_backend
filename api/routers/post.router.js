import express from "express";
import {
  getPostByCategory,
  getListPost,
  getPostDetail,
  getCommentByPost,
  addComment,
  deleteComment,
  getPostDetailAdmin,
  addReply,
  deleteCommentReply,
  getCategory,
} from "../controllers/post.controller.js";
const router = express.Router();

router.get("/getPost/category/:category/:page", getPostByCategory);
router.get("/category", getCategory);

router.get("/getPost/:page", getListPost);

router.get("/getPostDetail/:id", getPostDetail);

router.get("/postDetail/admin/:id", getPostDetailAdmin);

router.get("/comment/:id", getCommentByPost);

router.post("/comment/add", addComment);

router.post("/reply/add", addReply);

router.delete("/comment/delete/:id", deleteComment);

router.delete("/comment/reply/:id", deleteCommentReply);
export default router;
