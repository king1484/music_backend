import jwt from "jsonwebtoken";
import RefreshToken from "../schemas/RefreshToken.js";

async function generateTokens(email) {
  try {
    const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });
    const refreshTokenDoc = await RefreshToken.findOne({ email });
    if (refreshTokenDoc) {
      await refreshTokenDoc.deleteOne();
    }
    await new RefreshToken({ email, token: refreshToken }).save();
    return Promise.resolve({ accessToken, refreshToken });
  } catch (error) {
    return Promise.reject(error);
  }
}

export default generateTokens;
