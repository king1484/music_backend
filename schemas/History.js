import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  email: String,
  youtubeId: String,
  listenedAt: Date,
  title: String,
  artists: Array,
  thumbnailUrl: String
});

const History = mongoose.model("histories", historySchema);

export default History;
