import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  email: { type: String, required: true },
  youtubeId: { type: String, required: true },
  listenedAt: { type: Date, default: Date.now },
  title: { type: String, required: true },
  artists: { type: Array, required: true },
  thumbnailUrl: { type: String, required: true },
});

const History = mongoose.model("histories", historySchema);

export default History;
