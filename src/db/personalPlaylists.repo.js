const { dynamoDB } = require('../config/aws');
const TABLE = process.env.PERSONAL_PLAYLISTS_TABLE;

const createPersonalPlaylist = async (username, playlistData) => {
  const params = {
    TableName: TABLE,
    Item: {
      PK: `USER#${username}`,
      SK: `PLAYLIST#${playlistData.playlistId}`,
      username,
      ...playlistData,
      createdAt: new Date().toISOString(),
    },
  };
  await dynamoDB.put(params).promise();
  return params.Item;
};

const getPersonalPlaylists = async (username) => {
  const params = {
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${username}`,
      ':skPrefix': 'PLAYLIST#',
    },
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items;
};

const addSongToPlaylist = async (username, playlistId, songId) => {
  const params = {
    TableName: TABLE,
    Key: {
      PK: `USER#${username}`,
      SK: `PLAYLIST#${playlistId}`,
    },
    UpdateExpression:
      "SET songs = list_append(if_not_exists(songs, :empty), :song)",
    ExpressionAttributeValues: {
      ":song": [songId],
      ":empty": [],
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const renamePersonalPlaylist = async (username, playlistId, nameOfPlaylist) => {
  const params = {
    TableName: TABLE,
    Key: {
      PK: `USER#${username}`,
      SK: `PLAYLIST#${playlistId}`,
    },
    UpdateExpression: "SET nameOfPlaylist = :nameOfPlaylist",
    ExpressionAttributeValues: {
      ":nameOfPlaylist": nameOfPlaylist,
    },
    ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const removeSongFromPlaylist = async (username, playlistId, songId) => {
  const playlist = await dynamoDB
    .get({
      TableName: TABLE,
      Key: {
        PK: `USER#${username}`,
        SK: `PLAYLIST#${playlistId}`,
      },
    })
    .promise();

  if (!playlist.Item) {
    return null;
  }

  const songs = (playlist.Item.songs || []).filter(
    (id) => String(id) !== String(songId)
  );

  const params = {
    TableName: TABLE,
    Key: {
      PK: `USER#${username}`,
      SK: `PLAYLIST#${playlistId}`,
    },
    UpdateExpression: "SET songs = :songs",
    ExpressionAttributeValues: {
      ":songs": songs,
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDB.update(params).promise();
  return result.Attributes;
};

const deletePersonalPlaylist = async (username, playlistId) => {
  const params = {
    TableName: TABLE,
    Key: {
      PK: `USER#${username}`,
      SK: `PLAYLIST#${playlistId}`,
    },
  };

  await dynamoDB.delete(params).promise();

  return {
    message: "Playlist deleted successfully",
    playlistId,
  };
};

module.exports = {
  createPersonalPlaylist,
  getPersonalPlaylists,
  addSongToPlaylist,
  renamePersonalPlaylist,
  removeSongFromPlaylist,
  deletePersonalPlaylist,
};
