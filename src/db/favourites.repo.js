const { dynamoDB } = require('../config/aws');
const TABLE = process.env.FAVOURITES_TABLE;

async function getUserFavourites(userId) {
  const params = {
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
    },
  };

  const result = await dynamoDB.query(params).promise();
  return result.Items || [];
}

async function getFavourite(userId, songId) {
  const params = {
    TableName: TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `SONG#${songId}`,
    },
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item || null;
}

async function addFavourite(userId, songId) {
  const item = {
    PK: `USER#${userId}`,
    SK: `SONG#${songId}`,
    songId: String(songId),
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: TABLE,
    Item: item,
  };

  await dynamoDB.put(params).promise();
  return item;
}

async function removeFavourite(userId, songId) {
  const params = {
    TableName: TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `SONG#${songId}`,
    },
  };

  await dynamoDB.delete(params).promise();
  return true;
}

module.exports = {
  getUserFavourites,
  getFavourite,
  addFavourite,
  removeFavourite,
};