import jwt from "jsonwebtoken";
import RefreshToken from "../schemas/RefreshToken.js";

async function verifyRefreshToken(refreshToken) {
  const refreshTokenUser = await RefreshToken.findOne({ token: refreshToken });
  if (!refreshTokenUser) return false;
  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export default verifyRefreshToken;
