const { dynamoDB } = require('../config/aws');
const TABLE = process.env.CHATS_TABLE;

const getChatMessages = async (chatId) => {
  const params = {
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `CHAT#${chatId}`,
      ':skPrefix': 'MSG#',
    },
    ScanIndexForward: true, // true for chronological order (oldest to newest)
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items;
};

module.exports = { getChatMessages };