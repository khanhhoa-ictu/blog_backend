import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import { db } from "./../../index.js";
import { generateOTP } from "./../utils/opt.js";
import { sendEmailForgotPassword } from "../utils/nodemailer.js";

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
        res.send("update success");
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
      res.status(500).json({ msg: "server error" });
      return;
    }
  }
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const user = jwt.verify(token, "secret");
  db.query(
    "UPDATE user SET avatar = ? WHERE username = ?",
    [urlImg, user.username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        res.send("update success");
      }
    }
  );
};
export const requestForgotPassword = async (req, res) => {
  if (typeof req.params.email === "undefined") {
    res.json({ msg: "Invalid data" });
    return;
  }
  let email = req.params.email;
  let userFind = null;

  db.query("select * from users where email=?", [email], (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      userFind = result;
    }
  });
  if (userFind == null) {
    res.status(422).json({ msg: "Invalid data" });
  }
  let token = generateOTP();
  let sendEmail = await sendEmailForgotPassword(email, token);
  if (!sendEmail) {
    res.status(500).json({ msg: "Send email fail" });
    return;
  }
  userFind.token = token;
  try {
    await userFind.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(201).json({ msg: "success", email: email });
};

// export const verifyForgotPassword = (req, res) => {
//   if (
//     typeof req.body.email === "undefined" ||
//     typeof req.body.otp === "undefined"
//   ) {
//     res.status(402).json({ msg: "Invalid data" });
//     return;
//   }

//   let { email, otp } = req.body;
//   let userFind = null;

//   db.query("select * from users where email=?", [email], (err, result) => {
//     if (err) {
//       console.log(err);
//     }
//     if (result) {
//       userFind = result;
//     }
//   });
//   if (userFind == null) {
//     res.status(422).json({ msg: "Invalid data" });
//     return;
//   }
//   if (userFind.token != otp) {
//     res.status(422).json({ msg: "OTP fail" });
//     return;
//   }
//   res.status(200).json({ msg: "success", otp: otp });
// };

// export const forgotPassword = async (req, res) => {
//   if (
//     typeof req.body.email === "undefined" ||
//     typeof req.body.otp === "undefined" ||
//     typeof req.body.newPassword === "undefined"
//   ) {
//     res.status(402).json({ msg: "Invalid data" });
//     return;
//   }
//   let { email, otp, newPassword } = req.body;
//   let userFind = null;

//   db.query("select * from users where email=?", [email], (err, result) => {
//     if (err) {
//       console.log(err);
//     }
//     if (result) {
//       userFind = result;
//     }
//   });

//   if (userFind == null) {
//     res.status(422).json({ msg: "Invalid data" });
//     return;
//   }
//   if (userFind.token != otp) {
//     res.status(422).json({ msg: "OTP fail" });
//     return;
//   }

//   (userFind.password = newPassword), 10;
//   try {
//     await userFind.save();
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: err });
//     return;
//   }
//   res.status(201).json({ msg: "success" });
// };
