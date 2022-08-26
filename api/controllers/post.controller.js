import { db } from "../../index.js";

export const getPostByCategory = (req, res) => {
  const { category, page } = req.body;
  const pageSize = 10;
  db.query(
    "SELECT * FROM post WHERE category_id =?",
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
  let { page } = req.body;
  const pageSize = 10;
  db.query("SELECT * FROM post", (err, result) => {
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
  const id = req.params.id;
  db.query("SELECT * FROM post WHERE id =?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result[0]);
    }
  });
};

export const getCommentByPost = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT comments.id, content, post_id, reg_date, username, user_id FROM comments INNER JOIN user ON comments.user_id = user.id WHERE post_id=?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.send(result);
      }
    }
  );
};

export const addComment = (req, res) => {
  const { post_id, user_id, content } = req.body;
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

export const deleteComment = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM comments WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send("delete comment success");
    }
  });
};
