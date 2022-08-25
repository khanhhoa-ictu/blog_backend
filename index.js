import cors from "cors";
import express from "express";
import mysql from "mysql2";
import userManager from "./api/routers/manager.router.js";
import userRouter from "./api/routers/user.router.js";
import userPost from "./api/routers/post.router.js";

const app = express();
app.use(express.json());
app.use(cors());

export const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "123456",
  database: "blog",
});

// about

app.get("/about", (req, res) => {
  db.query("SELECT * FROM about", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result[0]);
    }
  });
});

app.use(userRouter);
app.use(userManager);
app.use(userPost);

app.listen(3002, () => {
  console.log("run");
});
