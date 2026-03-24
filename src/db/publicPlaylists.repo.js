const { dynamoDB } = require('../config/aws');
const TABLE = process.env.PUBLIC_PLAYLISTS_TABLE;

const createPublicPlaylist = async (playlistData) => {
  const params = {
    TableName: TABLE,
    Item: {
      PK: `PLAYLIST#${playlistData.playlistId}`,
      SK: 'META',
      ...playlistData,
      createdAt: new Date().toISOString(),
    },
  };
  await dynamoDB.put(params).promise();
  return params.Item;
};

const getPublicPlaylistById = async (playlistId) => {
  const params = {
    TableName: TABLE,
    Key: {
      PK: `PLAYLIST#${playlistId}`,
      SK: 'META',
    },
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

// Note: For a true "get all" on a large table, you would use a GSI or Scan. 
// For an MVP, a simple scan is acceptable but should be optimized later.
const getAllPublicPlaylists = async () => {
  const params = {
    TableName: TABLE,
    FilterExpression: 'SK = :sk',
    ExpressionAttributeValues: {
      ':sk': 'META'
    }
  };
  const result = await dynamoDB.scan(params).promise();
  return result.Items;
};

module.exports = { createPublicPlaylist, getPublicPlaylistById, getAllPublicPlaylists };