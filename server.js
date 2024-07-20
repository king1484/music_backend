import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./schemas/User.js";
import History from "./schemas/History.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { searchMusics, getSuggestions } from "node-youtube-music";

dotenv.config();

const app = express();

await mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.send({ data: "Email already registered!" });
    return;
  }
  const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  const hashedPass = await bcrypt.hash(password, 10);
  const user = new User({ name: name, email: email, password: hashedPass });
  await user.save();
  res.send({ data: "ok", token: token });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ data: "ok", token: token });
    } else {
      res.send({ data: "Password is incorrect!" });
    }
  } else {
    res.send({ data: "Email is not registered!" });
  }
});

app.post("/search", async (req, res) => {
  const { query } = req.body;
  const musics = await searchMusics(query);
  res.send(musics);
});

export async function getInfo(videoId) {
  const apiKey = "AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc";

  const headers = {
    "X-YouTube-Client-Name": "5",
    "X-YouTube-Client-Version": "19.09.3",
    Origin: "https://www.youtube.com",
    "User-Agent":
      "com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)",
    "content-type": "application/json",
  };

  const b = {
    context: {
      client: {
        clientName: "IOS",
        clientVersion: "19.09.3",
        deviceModel: "iPhone14,3",
        userAgent:
          "com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)",
        hl: "en",
        timeZone: "UTC",
        utcOffsetMinutes: 0,
      },
    },
    videoId,
    playbackContext: {
      contentPlaybackContext: { html5Preference: "HTML5_PREF_WANTS" },
    },
    contentCheckOk: true,
    racyCheckOk: true,
  };

  return fetch(
    `https://www.youtube.com/youtubei/v1/player?key${apiKey}&prettyPrint=false`,
    { method: "POST", body: JSON.stringify(b), headers }
  ).then((r) => r.json());
}

app.post("/song", async (req, res) => {
  const { id } = req.body;
  const data = await getInfo(id);
  const sortedAudio = data.streamingData.adaptiveFormats
    .filter((f) => f.mimeType.includes("audio"))
    .sort((a, b) => b.bitrate - a.bitrate);
  const finalAudios = sortedAudio.map(({ url, bitrate, mimeType }) => ({
    url,
    bitrate,
    mimeType,
  }));
  res.send(finalAudios);
});

app.post("/history", async (req, res) => {
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
  res.send("ok");
});

app.post("/getHistory", async (req, res) => {
  const { email } = req.body;
  const histories = await History.find({ email }).sort({ listenedAt: -1 });
  res.send(histories);
});

app.post("/suggestions", async (req, res) => {
  const { videoId } = req.body;
  const suggestions = await getSuggestions(videoId);
  res.send(suggestions.slice(0, 10));
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server started at http://localhost:5000");
});
