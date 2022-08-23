import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
const app = express();

app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "123456",
  database: "blog",
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM user where username = ? and password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        let token = jwt.sign(
          { username: username, iat: Math.floor(Date.now() / 1000) - 60 * 30 },
          "secret",
          { expiresIn: 1440 }
        );
        let refreshToken = jwt.sign(
          { username: username, iat: Math.floor(Date.now() / 1000) - 60 * 30 },
          "secret",
          { expiresIn: 14400 }
        );
        res.send({ token, refreshToken });
      }
    }
  );
});

app.post("/refreshToken", (req, res) => {
  // refresh the damn token
  const { refreshToken } = req.body;
  const user = jwt.verify(refreshToken, "secret");

  if (user) {
    const token = jwt.sign(user, "secret", { expiresIn: 14400 });
    const response = {
      token: token,
    };

    res.status(200).json(response);
  } else {
    res.status(404).send("Invalid request");
  }
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirm = req.body.confirm;

  if (password !== confirm) {
    res.send("password does not match");
    return;
  }

  db.query(
    "INSERT INTO user (username, password) VALUES (?,?)",
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.send("register success");
      }
    }
  );
});

app.post("/addPost", (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const summary = req.body.summary;
  const thumbnail = req.body.thumbnail;
  const category_id = req.body.category_id;

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
});

app.get("/manager/getPost", (req, res) => {
  db.query("SELECT id, title FROM post", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM post WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
});
// ben username

app.get("/getPost/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM post WHERE category_id =?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
});

app.get("/getPost", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM post", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result);
    }
  });
});

app.get("/getPostDetail/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM post WHERE id =?", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result[0]);
    }
  });
});

app.listen(3002, () => {
  console.log("run");
});
