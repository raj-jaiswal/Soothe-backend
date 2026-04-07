const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");

const findEnv = () => {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, ".env");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
};

const envPath = findEnv();
if (!envPath) {
  console.error("❌ Could not find .env file");
  process.exit(1);
}
require("dotenv").config({ path: envPath });

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const SONGS_TABLE = process.env.SONGS_TABLE || "Songs";
const PLAYLISTS_TABLE = process.env.PUBLIC_PLAYLISTS_TABLE || "PublicPlaylists";

const MIN_SONGS = 3;
// Defined target moods
const VALID_MOODS = [
  "love",
  "angry",
  "upbeat",
  "calm",
  "euphoric",
  "grief",
  "anxious",
];

const getAllSongs = async () => {
  console.log(`\n📦 Scanning "${SONGS_TABLE}" for all songs...`);
  const results = [];
  let lastKey;
  do {
    const params = {
      TableName: SONGS_TABLE,
      FilterExpression: "SK = :sk",
      ExpressionAttributeValues: { ":sk": "META" },
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    };
    const res = await dynamoDB.scan(params).promise();
    results.push(...res.Items);
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);
  console.log(`✅ Found ${results.length} songs total.\n`);
  return results;
};

const getPlaylistsData = (songs) => {
  const artistMap = {};
  const albumMap = {};
  const moodMap = {};

  // Initialize mood map with empty arrays for all 7 moods
  VALID_MOODS.forEach((m) => (moodMap[m] = []));

  for (const song of songs) {
    const songId = song.song_ID;

    // 1. Artists
    const rawArtist = song.artist || "Unknown Artist";
    const artists = rawArtist
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    artists.forEach((artist) => {
      if (!artistMap[artist]) artistMap[artist] = [];
      artistMap[artist].push(songId);
    });

    // 2. Albums
    const album = song.album || "Unknown Album";
    if (!albumMap[album]) {
      albumMap[album] = {
        songs: [],
        primaryArtist: artists[0] || "Unknown Artist",
      };
    }
    albumMap[album].songs.push(songId);

    // 3. Moods (Handling List of Maps structure from screenshot)
    if (song.moods && Array.isArray(song.moods)) {
      song.moods.forEach((moodObj) => {
        // Extract the string value from the map (e.g., moodObj.S)
        const moodValue = (moodObj.S || "").toLowerCase().trim();
        if (VALID_MOODS.includes(moodValue)) {
          moodMap[moodValue].push(songId);
        }
      });
    }
  }

  return { artistMap, albumMap, moodMap };
};

const writePlaylist = async (playlist) => {
  const item = {
    PK: `PLAYLIST#${playlist.playlistId}`,
    SK: "META",
    ...playlist,
    createdAt: new Date().toISOString(),
  };

  await dynamoDB.put({ TableName: PLAYLISTS_TABLE, Item: item }).promise();
  console.log(
    `  ✅ Created → [${playlist.type.toUpperCase()}] "${playlist.name}" (${playlist.songCount} songs)`,
  );
};

const toId = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

const seed = async () => {
  const songs = await getAllSongs();
  if (songs.length === 0) return console.error("❌ No songs found");

  const { artistMap, albumMap, moodMap } = getPlaylistsData(songs);

  // Process Artists
  console.log("🎤 Generating Artist Playlists...");
  for (const [name, songIds] of Object.entries(artistMap)) {
    if (songIds.length >= MIN_SONGS) {
      await writePlaylist({
        playlistId: `artist_${toId(name)}`,
        name: name,
        type: "artist",
        description: `Top tracks from ${name}`,
        songIds,
        songCount: songIds.length,
      });
    }
  }

  // Process Albums
  console.log("\n💿 Generating Album Playlists...");
  for (const [name, data] of Object.entries(albumMap)) {
    if (data.songs.length >= MIN_SONGS) {
      await writePlaylist({
        playlistId: `album_${toId(name)}`,
        name: name,
        type: "album",
        description: `Album: ${name} by ${data.primaryArtist}`,
        artist: data.primaryArtist,
        songIds: data.songs,
        songCount: data.songs.length,
      });
    }
  }

  // Process Moods
  console.log("\n🎭 Generating Mood Playlists...");
  for (const [mood, songIds] of Object.entries(moodMap)) {
    if (songIds.length >= MIN_SONGS) {
      await writePlaylist({
        playlistId: `mood_${mood}`,
        name: mood.charAt(0).toUpperCase() + mood.slice(1), // Capitalize name
        type: "mood",
        description: `Songs to make you feel ${mood}`,
        songIds,
        songCount: songIds.length,
      });
    } else {
      console.log(`  ⏭️ Skipping "${mood}" (only ${songIds.length} songs)`);
    }
  }

  console.log("\n🎉 Seeding Complete!");
};

seed().catch((err) => console.error("❌ Fatal error:", err));
