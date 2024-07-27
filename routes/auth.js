import { Router } from "express";
import User from "../schemas/User.js";
import bcrypt from "bcrypt";
import generateTokens from "../utils/generateTokens.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res
        .status(400)
        .json({ error: true, message: "Email already registered!" });
      return;
    }
    const { accessToken, refreshToken } = await generateTokens(email);
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password, saltRounds);
    const user = new User({ name: name, email: email, password: hashedPass });
    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(201).json({
      error: false,
      accessToken: accessToken,
      message: "User registered successfully!",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error!" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        const { accessToken, refreshToken } = await generateTokens(email);
        res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          })
          .json({
            error: false,
            accessToken: accessToken,
            message: "User logged in successfully!",
          });
      } else {
        res
          .status(401)
          .json({ error: true, message: "Password is incorrect!" });
      }
    } else {
      res
        .status(400)
        .json({ error: true, message: "Email is not registered!" });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error!" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { email } = req.body;
    const { accessToken, refreshToken } = await generateTokens(email);
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        error: false,
        accessToken: accessToken,
        message: "User logged in successfully!",
      });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error!" });
  }
});

export default router;
