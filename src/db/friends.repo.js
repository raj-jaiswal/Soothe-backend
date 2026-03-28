const { dynamoDB } = require('../config/aws');
const TABLE = process.env.USERS_TABLE;

// Helper to fetch user
const getUser = async (username) => {
  const result = await dynamoDB.get({
    TableName: TABLE,
    Key: { PK: `USER#${username}`, SK: 'PROFILE' },
  }).promise();
  return result.Item;
};

// Helper to save user
const saveUser = async (userItem) => {
  await dynamoDB.put({
    TableName: TABLE,
    Item: userItem,
  }).promise();
};

// Search users by username or name (Limit 10)
const searchUsers = async (query, currentUsername) => {
  const params = {
    TableName: TABLE,
    FilterExpression: '(contains(username, :q) OR contains(#nm, :q)) AND username <> :cu',
    ExpressionAttributeNames: { '#nm': 'name' },
    ExpressionAttributeValues: { 
      ':q': query.toLowerCase(),
      ':cu': currentUsername 
    },
    Limit: 10, // Returns top 10 results max
  };
  const result = await dynamoDB.scan(params).promise();
  return result.Items.map(u => ({
    id: u.username,
    name: u.name,
    handle: `@${u.username}`,
  }));
};

// Fetch basic info for a list of usernames
const getDetailedUsers = async (usernames) => {
  if (!usernames || usernames.length === 0) return [];
  
  // DynamoDB BatchGetItem (up to 100 items per request)
  const keys = usernames.map(u => ({ PK: `USER#${u}`, SK: 'PROFILE' }));
  const params = { RequestItems: { [TABLE]: { Keys: keys } } };
  
  const result = await dynamoDB.batchGet(params).promise();
  return result.Responses[TABLE].map(u => ({
    id: u.username,
    name: u.name,
    handle: `@${u.username}`
  }));
};

const sendFriendRequest = async (sender, receiverUsername) => {
  const receiver = await getUser(receiverUsername);
  if (!receiver) throw new Error('User not found');

  const requests = receiver.friendRequests || [];
  if (!requests.includes(sender)) {
    requests.push(sender);
    receiver.friendRequests = requests;
    await saveUser(receiver);
  }
};

const acceptFriendRequest = async (username, senderUsername) => {
  const user = await getUser(username);
  const sender = await getUser(senderUsername);

  if (!user || !sender) throw new Error('User not found');

  // Remove from user's requests and add to friends
  user.friendRequests = (user.friendRequests || []).filter(req => req !== senderUsername);
  
  if (!(user.friends || []).includes(senderUsername)) {
    user.friends = [...(user.friends || []), senderUsername];
  }

  // Add user to sender's friends list
  if (!(sender.friends || []).includes(username)) {
    sender.friends = [...(sender.friends || []), username];
  }

  await saveUser(user);
  await saveUser(sender);
};

const rejectFriendRequest = async (username, senderUsername) => {
  const user = await getUser(username);
  if (!user) throw new Error('User not found');

  user.friendRequests = (user.friendRequests || []).filter(req => req !== senderUsername);
  await saveUser(user);
};

module.exports = {
  getUser,
  searchUsers,
  getDetailedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest
};