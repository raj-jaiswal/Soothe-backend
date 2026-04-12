const { dynamoDB } = require('../config/aws');
const TABLE = process.env.USERS_TABLE;

const createUser = async (userData) => {
  const params = {
    TableName: TABLE,
    Item: {
      PK: `USER#${userData.username}`,
      SK: 'PROFILE',
      emailGSI: userData.email,
      ...userData,
      createdAt: new Date().toISOString(),
    },
  };
  await dynamoDB.put(params).promise();
  return params.Item;
};

const getUserByUsername = async (username) => {
  const params = {
    TableName: TABLE,
    Key: { PK: `USER#${username}`, SK: 'PROFILE' },
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

const updateUserStatus = async (username, updates) => {
  // Utility for updating specific fields like isVerified or OTP
  let updateExpression = 'set';
  let expressionAttributeValues = {};
  
  Object.keys(updates).forEach((key, index) => {
    updateExpression += ` ${key} = :val${index},`;
    expressionAttributeValues[`:val${index}`] = updates[key];
  });
  
  updateExpression = updateExpression.slice(0, -1); // remove trailing comma

  const params = {
    TableName: TABLE,
    Key: { PK: `USER#${username}`, SK: 'PROFILE' },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const addSongToHistory = async (username, song) => {
  const timestamp = new Date().toISOString();
  
  // Fetch the user's profile to get current history
  const userProfile = await getUserByUsername(username);
  if (!userProfile) return null;

  // Calculate 1 week ago date
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const cutoff = oneWeekAgo.toISOString();

  let history = userProfile.history || [];
  
  // Filter out any history older than exactly one week
  history = history.filter(item => item.timestamp && item.timestamp >= cutoff);
  
  const songId = song.song_ID || song.songId || song.id || 'unknown';
  
  // Append new listen event to history
  history.push({
    songId: songId,
    timestamp: timestamp,
    name: song.name || song.title || 'Unknown Song',
    artist: song.artist || 'Unknown Artist',
    duration: song.duration || 0,
  });
  
  // Update the user's profile
  const params = {
    TableName: TABLE,
    Key: { PK: `USER#${username}`, SK: 'PROFILE' },
    UpdateExpression: 'SET history = :history',
    ExpressionAttributeValues: {
      ':history': history
    },
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const getUserHistory = async (username) => {
  const userProfile = await getUserByUsername(username);
  if (!userProfile || !userProfile.history) return [];
  
  // 1. Sort history newest first to ensure we keep the latest metadata/timestamp
  const sorted = userProfile.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 2. Deduplicate while counting frequency
  const uniqueSongsMap = new Map();
  
  sorted.forEach(item => {
    const sId = item.songId || 'unknown';
    if (!uniqueSongsMap.has(sId)) {
      uniqueSongsMap.set(sId, {
        ...item,
        playCount: 1
      });
    } else {
      const existing = uniqueSongsMap.get(sId);
      existing.playCount += 1;
    }
  });

  // Return unique songs as an array (already sorted by latest timestamp because we processed newest first)
  return Array.from(uniqueSongsMap.values());
};

const getUserTopSongs = async (username, limit = 3) => {
  const userProfile = await getUserByUsername(username);
  if (!userProfile || !userProfile.history) return { topSongs: [], totalStreams: 0, moods: [] };
  
  const history = userProfile.history;
  const totalStreams = history.length; // Each entry is 1 stream

  // Calculate frequency
  const songCounts = {};
  history.forEach(item => {
    const sId = item.songId;
    if (!songCounts[sId]) {
      songCounts[sId] = {
        id: sId,
        title: item.name || 'Unknown Song',
        artist: item.artist || 'Unknown Artist',
        duration: item.duration || 0,
        count: 0
      };
    }
    songCounts[sId].count += 1;
  });

  const uniqueSongs = Object.values(songCounts);
  
  const songRepo = require('./songs.repo');
  const moodAggregation = {};

  for (const s of uniqueSongs) {
    try {
      const songMeta = await songRepo.getSongById(s.id);
      if (songMeta && songMeta.moods) {
        for (const m of songMeta.moods) {
          const moodStr = m.S || m; 
          const normalizedStr = moodStr.charAt(0).toUpperCase() + moodStr.slice(1).toLowerCase();
          moodAggregation[normalizedStr] = (moodAggregation[normalizedStr] || 0) + s.count;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch mood for song ' + s.id);
    }
  }

  const moods = Object.keys(moodAggregation).map(m => ({ label: m, count: moodAggregation[m] }));

  const topSongs = uniqueSongs
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { topSongs, totalStreams, moods };
};

module.exports = { 
  createUser, 
  getUserByUsername, 
  updateUserStatus, 
  addSongToHistory, 
  getUserHistory,
  getUserTopSongs
};