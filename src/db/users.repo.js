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

module.exports = { createUser, getUserByUsername, updateUserStatus };