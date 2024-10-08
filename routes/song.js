import { Router } from "express";
import { searchMusics, getSuggestions } from "node-youtube-music";
import axios from "axios";
// import getInfo from "../utils/videoInfo.js";
import auth from "../middleware/auth.js";
import ytdl from "@distube/ytdl-core";
import fs from "fs";

const router = Router();

router.post("/search", auth, async (req, res) => {
  try {
    const { query } = req.body;
    const musics = await searchMusics(query);
    res.status(200).json({ error: false, data: musics });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

router.get("/stream", async (req, res) => {
  const id = req.query.id;
  const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookies.json")))
  const data = await ytdl.getInfo("https://www.youtube.com/watch?v=" + id, {agent});
  // const adaptiveFormats = data.streamingData.adaptiveFormats;
  const adaptiveFormats = data.formats.filter((f) => f.isHLS === false);
  const sortedAudio = adaptiveFormats
    .filter((f) => f.mimeType.includes("audio"))
    .sort((a, b) => b.bitrate - a.bitrate);
  const finalAudios = sortedAudio.map(({ url, bitrate, mimeType }) => ({
    url,
    bitrate,
    mimeType,
  }));
  res.setHeader("Content-Type", "audio/mpeg");
  const finalUrl = finalAudios[0].url;

  axios({
    method: "get",
    url: finalUrl,
    responseType: "stream",
    headers: req.headers["range"] ? { range: req.headers["range"] } : undefined,
  })
    .then((response) => {
      if (req.headers["range"]) {
        res.status(206);
        res.set({
          "Content-Range": response.headers["content-range"],
          "Accept-Ranges": response.headers["accept-ranges"],
          "Content-Length": response.headers["content-length"],
          "Content-Type": response.headers["content-type"],
        });
      } else {
        res.set({
          "Content-Type": response.headers["content-type"],
        });
      }
      response.data.pipe(res);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Failed to stream audio");
    });
});

router.post("/suggestions", auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    const suggestions = await getSuggestions(videoId);
    res.status(200).json({ error: false, data: suggestions.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

export default router;
