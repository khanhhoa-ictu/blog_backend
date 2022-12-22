import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import { db } from "./../../index.js";
import { generateOTP } from "./../utils/opt.js";
import { sendEmailForgotPassword } from "../utils/nodemailer.js";
import bcrypt from "bcrypt";
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

export const register = async (req, res) => {
  if (
    typeof req.body.username === "undefined" ||
    typeof req.body.password === "undefined" ||
    typeof req.body.confirm === "undefined"
  ) {
    res.status(422).json({ msg: "dữ liệu không hợp lệ" });
    return;
  }
  let { username, password, confirm } = req.body;
  if (password !== confirm) {
    res.status(422).json({ msg: "password không trùng hợp" });
    return;
  }
  password = bcrypt.hashSync(password, 10);
  db.query(
    "SELECT * FROM user WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        let user = result[0];
        if (!!user) {
          res.status(422).json({ msg: "Tài khoản đã tồn tại" });
          return;
        }
      }
    }
  );
  const role = "user";
  db.query(
    "INSERT INTO user (username, password, role) VALUES (?,?,?)",
    [username, password, role],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.status(200).json({ msg: "đăng ký thành công" });
      }
    }
  );
};

export const login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM user where username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        const user = { id: result[0]?.id, username: result[0]?.username };
        if (!user.id) {
          res
            .status(422)
            .json({ msg: "Tài khoản hoặc mật khẩu không chính xác" });
          return;
        }
        if (!bcrypt.compareSync(password, result[0].password)) {
          res
            .status(422)
            .json({ msg: "Tài khoản hoặc mật khẩu không chính xác" });
          return;
        }

        let token = jwt.sign({ username: username }, "secret", {
          expiresIn: "1 days",
        });
        let refreshToken = jwt.sign({ username: username }, "re-secret", {
          expiresIn: "10 days",
        });
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
  let user;
  try {
    user = jwt.verify(token, "secret");
  } catch (error) {
    res.status(401).json({ msg: "refetch token" });
    return;
  }

  db.query(
    "SELECT * FROM user WHERE username=?",
    [user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const { password, ...response } = result[0];
        res.send(response);
      }
    }
  );
};

export const about = (req, res) => {
  const { about, id } = req.body;
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
        if (user.id !== Number(id)) {
          return res.status(403).json("bạn không có quyền");
        }
        db.query(
          "UPDATE user SET about = ? WHERE id=?",
          [about, id],
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(422).json("cập nhật thông tin thất bại");
            }
            if (result) {
              res.status(200).json("cập nhật thông tin thành công");
            }
          }
        );
      }
    }
  );
};

export const detail = (req, res) => {
  const { username, email, address, id } = req.body;
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
        if (user.id !== Number(id)) {
          return res.status(403).json("bạn không có quyền");
        }
        db.query(
          "SELECT * FROM user WHERE email = ? AND NOT id = ?",
          [email, id],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result.length > 0) {
              res.status(422).json({ msg: "gmail đã tồn tại" });
              return;
            }
            db.query(
              "UPDATE user SET  email = ?, address = ? WHERE id=?",
              [email, address, id],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(422).json({ msg: "cập nhật thông tin thất bại" });
                }
                if (result) {
                  res
                    .status(200)
                    .json({ msg: "cập nhật thông tin thành công" });
                }
              }
            );
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
  if (urlImg !== null) {
    if (urlImg === false) {
      res.status(500).json({ msg: "upload hình ảnh thất bại" });
      return;
    }
  }
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let user = jwt.verify(token, "secret");
  db.query(
    "UPDATE user SET avatar = ? WHERE username = ?",
    [urlImg, user.username],
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
export const requestForgotPassword = async (req, res) => {
  if (typeof req.body.email === "undefined") {
    res.json({ msg: "Invalid data" });
    return;
  }
  let email = req.body.email;
  let userFind = null;
  try {
    db.query(
      "select * from user where email=?",
      [email],
      async (err, result) => {
        if (err) {
          gm;
          console.log(err);
        }
        if (result) {
          userFind = result[0];
          if (!userFind) {
            res.status(422).json({ msg: "không tìm thấy email" });
            return;
          }
          let token = generateOTP();
          let sendEmail = await sendEmailForgotPassword(email, token);
          if (!sendEmail) {
            res.status(500).json({ msg: "gửi mail thất bại" });
            return;
          }
          db.query(
            "UPDATE user SET tokenForgot = ? WHERE email = ?",
            [token, email],
            (err, result) => {
              if (err) {
                console.log(err);
              }
              if (result) {
                res.status(200).json({ msg: "gửi mail thành công" });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const verifyForgotPassword = (req, res) => {
  if (
    typeof req.body.email === "undefined" ||
    typeof req.body.otp === "undefined"
  ) {
    res.status(402).json({ msg: "vui lòng nhập đủ dữ liệu" });
    return;
  }

  let { email, otp } = req.body;
  let userFind = null;

  db.query("select * from user where email=?", [email], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      userFind = result[0];

      if (userFind.tokenForgot !== otp) {
        res.status(422).json({ msg: "OTP không chính xác" });
        return;
      }
      db.query(
        "UPDATE user SET isForgot = ? WHERE email = ?",
        [1, email],
        (err, result) => {
          if (result) {
            res.status(200).json({ msg: "success", otp: otp });
          }
          if (err) {
            console.log(err);
          }
        }
      );
    }
  });
};

export const forgotPassword = async (req, res) => {
  if (typeof req.body.newPassword === "undefined") {
    res.status(402).json({ msg: "vui lòng nhập đầy đủ dữ liệu" });
    return;
  }
  let { email, newPassword } = req.body;

  newPassword = bcrypt.hashSync(newPassword, 10);
  db.query("select * from user where email=?", [email], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      userFind = result[0];
      db.query(
        "update user set password=? where email=?",
        [newPassword, email],
        (err, result) => {
          if (err) {
            console.log(err);
          }
          if (userFind.isForgot) {
            res.status(200).json({ msg: "đổi mật khẩu thành công" });
            return;
          }
          res.status(422).json({ msg: "đổi mật khẩu không thành công" });
        }
      );
    }
  });
};

export const profileById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM user WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0]);
    }
  });
};

export const aboutAdmin = (req, res) => {
  db.query("SELECT * FROM about", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send(result[0]);
    }
  });
};
