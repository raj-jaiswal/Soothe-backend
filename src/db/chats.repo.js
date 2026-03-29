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
    ScanIndexForward: true,
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items;
};

// NEW: Get the single most recent message for the inbox preview
const getLatestMessage = async (chatId) => {
  const params = {
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `CHAT#${chatId}`,
      ':skPrefix': 'MSG#',
    },
    ScanIndexForward: false, // Newest to oldest
    Limit: 1,
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items[0] || null;
};

module.exports = { getChatMessages, getLatestMessage };