import { db } from "../../index.js";
import jwt from "jsonwebtoken";

export const addPost = (req, res) => {
  const { title, content, summary, thumbnail, category_id } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, "secret");
  } catch (error) {
    return res.status(422).json({ msg: "token không hợp lệ" });
  }
  db.query(
    "SELECT * FROM user WHERE username=?",
    [user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        user = result[0];
        if (user.role !== "admin") {
          return res.status(403).json("bạn không có quyền");
        }
        db.query(
          "INSERT INTO post (title, content, summary, thumbnail, category_id) VALUES (?,?,?,?,?)",
          [title, content, summary, thumbnail, category_id],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result) {
              res.send("add post success");
            }
          }
        );
      }
    }
  );
};
export const getPostManager = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, "secret");
  } catch (error) {
    return res.status(422).json({ msg: "token không hợp lệ" });
  }
  db.query(
    "SELECT * FROM user WHERE username=?",
    [user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        user = result[0];
        if (user.role !== "admin") {
          return res.status(403).json("bạn không có quyền");
        }
        db.query("SELECT id, title FROM post", (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result) {
            res.send(result);
          }
        });
      }
    }
  );
};

export const deletePost = (req, res) => {
  const id = req.params.id;
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, "secret");
  } catch (error) {
    return res.status(422).json({ msg: "token không hợp lệ" });
  }
  db.query(
    "SELECT * FROM user WHERE username=?",
    [user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        user = result[0];
        if (user.role !== "admin") {
          return res.status(403).json("bạn không có quyền");
        }
        db.query(
          "SELECT * FROM user WHERE username=?",
          [user.username],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result) {
              user = result[0];
              if (user.role !== "admin") {
                return res.status(403).json("bạn không có quyền");
              }
              db.query("DELETE FROM post WHERE id=?", [id], (err, result) => {
                if (err) {
                  console.log(err);
                }
                if (result) {
                  res.send(result);
                }
              });
            }
          }
        );
      }
    }
  );
};

export const getListUser = (req, res) => {
  db.query("SELECT * FROM user ", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
};

export const deleteUser = (req, res) => {
  const id = req.params.id;
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, "secret");
  } catch (error) {
    return res.status(422).json({ msg: "token không hợp lệ" });
  }
  db.query(
    "SELECT * FROM user WHERE username=?",
    [user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        user = result[0];
        if (user.role !== "admin") {
          return res.status(403).json("bạn không có quyền");
        }
        db.query("DELETE FROM user WHERE id=?", [id], (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result) {
            res.send("delete user success");
          }
        });
      }
    }
  );
};

export const editPost = (req, res) => {
  const { title, content, summary, thumbnail, category_id, id } = req.body;

  db.query(
    "UPDATE post SET title = ?, content = ?, summary = ?, thumbnail = ?, category_id = ? WHERE id = ?  ",
    [title, content, summary, thumbnail, category_id, id],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.send("cập nhật bài viết thành công");
      }
    }
  );
};
