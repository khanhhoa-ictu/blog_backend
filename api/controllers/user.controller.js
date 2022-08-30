import { db } from "./../../index.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  if (
    typeof req.body.username === "undefined" ||
    typeof req.body.password === "undefined" ||
    typeof req.body.confirm === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { username, password, confirm } = req.body;

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
};

export const login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM user where username = ? and password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length) {
        let token = jwt.sign(
          { username: username, iat: Math.floor(Date.now() / 1000) - 60 * 30 },
          "secret",
          { expiresIn: "1 days" }
        );
        let refreshToken = jwt.sign(
          { username: username, iat: Math.floor(Date.now() / 1000) - 60 * 30 },
          "re-secret",
          { expiresIn: "10 days" }
        );
        const user = { id: result[0].id, username: result[0].username };
        res.send({ token, refreshToken, user });
      }
    }
  );
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  const user = jwt.verify(refreshToken, "re-secret");

  if (user) {
    const token = jwt.sign(user, "secret", { expiresIn: 14400 });
    const response = {
      token: token,
    };

    res.status(200).json(response);
  } else {
    res.status(404).send("Invalid request");
  }
};

export const profile = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const user = jwt.verify(token, "secret");
  db.query(
    "SELECT * FROM user WHERE username=?",
    [user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result[0]);
      }
    }
  );
};

export const about = (req, res) => {
  const { about, id } = req.body;
  db.query(
    "UPDATE user SET about = ? WHERE id=?",
    [about, id],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        console.log(result);
        res.send("update success");
      }
    }
  );
};

export const detail = (req, res) => {
  const { username, email, address, id } = req.body;
  db.query(
    "UPDATE user SET  email = ?, address = ? WHERE id=?",
    [email, address, id],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        console.log(result);
        res.send("update success");
      }
    }
  );
};
