import { Router } from "express";
import History from "../schemas/History.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/addSong", auth, async (req, res) => {
  try {
    const { email, music, youtubeId } = req.body;
    await History.findOneAndUpdate(
      { email: email, youtubeId: youtubeId },
      {
        $set: {
          title: music.title,
          artists: music.artists,
          thumbnailUrl: music.thumbnailUrl,
          listenedAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );
    res.status(201).json({ error: false, message: "History saved" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

router.post("/getSongs", auth, async (req, res) => {
  try {
    const { email } = req.body;
    const histories = await History.find({ email }).sort({ listenedAt: -1 });
    res.status(200).json({ error: false, data: histories });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

export default router;
