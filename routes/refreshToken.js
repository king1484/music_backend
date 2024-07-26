import { Router } from "express";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";
import jwt from "jsonwebtoken";
import RefreshToken from "../schemas/RefreshToken.js";

const router = Router();

router.post("/", async (req, res) => {
  console.log("refresh token");
  const refreshToken = req.cookies["refreshToken"];
  const { email } = req.body;
  if (!refreshToken || !email)
    return res
      .status(401)
      .json({ error: true, message: "Invalid refresh token!" });
  const isValid = await verifyRefreshToken(refreshToken);
  console.log(isValid);
  if (isValid) {
    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    res.status(200).json({
      error: false,
      accessToken: accessToken,
      message: "Token refreshed successfully!",
    });
  } else {
    res.status(401).json({ error: true, message: "Invalid refresh token!" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken)
      return res
        .status(401)
        .json({ error: true, message: "Invalid refresh token!" });
    const refreshTokenUser = await RefreshToken.findOne({
      token: refreshToken,
    });
    if (!refreshTokenUser) {
      res
        .status(200)
        .json({ error: false, message: "Logged out successfully!" });
      return;
    }
    await refreshTokenUser.deleteOne();
    res.status(200).json({ error: false, message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error!" });
  }
});

export default router;
