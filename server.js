import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/song.js";
import historyRoutes from "./routes/history.js";
import refreshRoutes from "./routes/refreshToken.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

await mongoose.connect(process.env.MONGODB_URI);

app.use((req, res, next) => {
  console.log(`API called: ${req.method} ${req.originalUrl}`);
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

app.use("/api/auth", authRoutes);
app.use("/api/song", songRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/refreshToken", refreshRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`Server started at port ${process.env.PORT || 5000}`);
});
