import { db } from "../../index.js";

export const addPost = (req, res) => {
  const { title, content, summary, thumbnail, category_id } = req.body;

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
};
export const getPostManager = (req, res) => {
  db.query("SELECT id, title FROM post", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
};

export const deletePost = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM post WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
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
  db.query("DELETE FROM user WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send("delete user success");
    }
  });
};
