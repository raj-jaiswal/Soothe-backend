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

module.exports = { createPersonalPlaylist, getPersonalPlaylists };