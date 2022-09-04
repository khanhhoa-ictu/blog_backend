import cors from "cors";
import express from "express";
import mysql from "mysql2";
import userManager from "./api/routers/manager.router.js";
import userRouter from "./api/routers/user.router.js";
import userPost from "./api/routers/post.router.js";
import { avatar } from "./api/controllers/user.controller.js";
import multer from 'multer'
import bodyParser from 'body-parser';


const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

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
