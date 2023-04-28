import { db } from "../../index.js";
import jwt from "jsonwebtoken";

export const getPostByCategory = (req, res) => {
  const { category, page } = req.params;
  const pageSize = 10;
  db.query(
    "SELECT * FROM post WHERE category_id =? ORDER BY reg_date DESC",
    [category],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        const data = {
          total: result.length,
          post: result.slice(pageSize * page - pageSize, pageSize * page),
        };
        res.send(data);
      }
    }
  );
};

export const getListPost = (req, res) => {
  let { page } = req.params;
  const pageSize = 10;
  db.query("SELECT * FROM post ORDER BY reg_date DESC", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      const data = {
        listPost: result.slice(pageSize * page - pageSize, pageSize * page),
        total: result.length,
      };
      res.send(data);
    }
  });
};

export const getPostDetail = (req, res) => {
  const slug = req.params.slug;
  db.query("SELECT * FROM post WHERE slug =?", [slug], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      const post = result[0];
      if (!post) {
        res.status(422).json("không tìm thấy bài viết hợp lệ");
        return;
      }
      db.query(
        "UPDATE post SET view = ? WHERE slug = ?",
        [post.view + 1, post.slug],
        (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result) {
            res.status(200).json(post);
          }
        }
      );
    }
  });
};

export const getPostDetailAdmin = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM post WHERE id =?", [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(422).json("không tìm thấy bài viết hợp lệ");
    }

    if (result) {
      const post = result[0];
      res.status(200).json(post);
    }
  });
};
export const getCommentByPost = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT comments.id, content, post_id, reg_date, username, avatar, user_id FROM comments INNER JOIN user ON comments.user_id = user.id WHERE post_id=? ORDER BY reg_date DESC",
    [id],
    async (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        await Promise.all(
          result.map(async (comment) => {
            let results = await new Promise((resolve, reject) =>
              db.query(
                "SELECT reply.id, content, user_id, comment_id, reg_date, username, avatar FROM reply INNER JOIN user ON reply.user_id = user.id WHERE comment_id = ? ORDER BY reg_date DESC",
                [comment.id],
                (err, replyComment) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(replyComment);
                    comment.reply = replyComment;
                  }
                }
              )
            );
            return result;
          })
        );
        res.send(result);
      }
    }
  );
};

export const addComment = (req, res) => {
  const { post_id, user_id, content } = req.body;
  if (!user_id) {
    res.status(422).json("vui lòng đăng nhập để bình luận");
    return;
  }
  db.query(
    "INSERT INTO comments (post_id, user_id, content) VALUES (?,?,?)",
    [post_id, user_id, content],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.send("add comment success");
      }
    }
  );
};

export const addReply = (req, res) => {
  const { content, comment_id, user_id } = req.body;
  if (!user_id) {
    res.status(422).json("vui lòng đăng nhập để bình luận");
    return;
  }
  db.query(
    "INSERT INTO reply (content, comment_id, user_id) VALUES (?,?,?)",
    [content, comment_id, user_id],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.send("add reply success");
      }
    }
  );
};

export const deleteComment = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM comments WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(422).json("không tìm thấy bài viết hợp lệ");
    }
    if (result) {
      res.send("delete comment success");
    }
  });
};

export const deleteCommentReply = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM reply WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(422).json("không tìm thấy bài viết hợp lệ");
    }
    if (result) {
      res.send("delete comment success");
    }
  });
};

export const getCategory = (req, res) => {
  db.query("SELECT * FROM category", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
};

export const getAllPost = (req, res) => {
  db.query("SELECT id, title, slug FROM post", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
};
