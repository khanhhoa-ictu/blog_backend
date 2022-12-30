import { db } from "../../index.js";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";

cloudinary.config({
  cloud_name: "smile159",
  api_key: "678772438397898",
  api_secret: "zvdEWEfrF38a2dLOtVp-3BulMno",
});

const uploadImg = async (path) => {
  let res;
  try {
    res = await cloudinary.uploader.upload(path);
  } catch (err) {
    console.log(err);
    return false;
  }
  return res.secure_url;
};

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

export const editAbout = (req, res) => {
  const { content, facebook, instal, linkedin, title, youtube } = req.body;
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
          "UPDATE about SET content = ?, facebook = ?, instal = ?, linkedin = ?, title= ?, youtube= ?",
          [content, facebook, instal, linkedin, title, youtube],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result) {
              res.send("cập nhật bài viết thành công");
            }
          }
        );
      }
    }
  );
};

export const avatar = async (req, res) => {
  let urlImg = null;
  if (typeof req.file !== "undefined") {
    urlImg = await uploadImg(req.file.path);
  }
  if (!urlImg) {
    res.status(500).json({ msg: "upload hình ảnh thất bại" });
    return;
  }
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let user = jwt.verify(token, "secret");
  db.query(
    "UPDATE about SET thumbnail = ? WHERE id = ?",
    [urlImg, 1],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.status(200).json({ msg: "thay đổi ảnh đại diện thành công" });
      }
    }
  );
};

export const addCategory = (req, res) => {
  const { name_category } = req.body;
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
          "INSERT INTO category (name_category) VALUES (?)",
          [name_category],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result) {
              res.send("add category success");
            }
          }
        );
      }
    }
  );
};

export const editCategory = (req, res) => {
  const { name_category, id } = req.body;
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
          "UPDATE category SET name_category = ? WHERE id = ?",
          [name_category, id],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result) {
              res.send("update category success");
            }
          }
        );
      }
    }
  );
};

export const deleteCategory = (req, res) => {
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
        db.query("DELETE FROM category WHERE id=?", [id], (err, result) => {
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
