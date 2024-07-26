import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const refreshTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

const RefreshToken = mongoose.model("refreshTokens", refreshTokenSchema);

export default RefreshToken;
