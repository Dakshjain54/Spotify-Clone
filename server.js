const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const SONGS_DIR = path.join(__dirname, "songs");

// Get all albums
app.get("/api/albums", (req, res) => {
    fs.readdir(SONGS_DIR, { withFileTypes: true }, (err, dirs) => {
        if (err) return res.status(500).json({ error: "Cannot read albums" });

        const albums = dirs
            .filter(d => d.isDirectory())
            .map(d => {
                let infoPath = path.join(SONGS_DIR, d.name, "info.json");
                let info = {};
                if (fs.existsSync(infoPath)) {
                    info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
                }
                return {
                    name: d.name,
                    cover: `/songs/${d.name}/cover.jpg`,
                    title: info.title || d.name,
                    description: info.description || ""
                };
            });

        res.json(albums);
    });
});

// Get songs in a specific album
app.get("/api/songs", (req, res) => {
    const folder = req.query.folder;
    if (!folder) return res.status(400).json({ error: "Folder name is required" });

    const dirPath = path.join(SONGS_DIR, folder);
    fs.readdir(dirPath, (err, files) => {
        if (err) return res.status(500).json({ error: "Cannot read folder" });

        const songs = files
            .filter(file => file.toLowerCase().endsWith(".mp3"))
            .map(file => `/songs/${folder}/${file}`);

        res.json(songs);
    });
});

app.use("/songs", express.static(SONGS_DIR));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});
