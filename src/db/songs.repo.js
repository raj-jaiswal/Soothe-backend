const { dynamoDB } = require('../config/aws');
const TABLE = process.env.SONGS_TABLE;

const getSongById = async (songId) => {
  const params = {
    TableName: TABLE,
    Key: { PK: `SONG#${songId}`, SK: 'META' },
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

module.exports = { getSongById };