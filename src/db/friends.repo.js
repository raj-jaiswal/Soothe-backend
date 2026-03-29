const { dynamoDB } = require('../config/aws');
const TABLE = process.env.USERS_TABLE;

const getUser = async (username) => {
  const result = await dynamoDB.get({
    TableName: TABLE,
    Key: { PK: `USER#${username}`, SK: 'PROFILE' },
  }).promise();
  return result.Item;
};

const saveUser = async (userItem) => {
  await dynamoDB.put({
    TableName: TABLE,
    Item: userItem,
  }).promise();
};

const searchUsers = async (query, currentUsername) => {
  const params = {
    TableName: TABLE,
    // Using #nm to avoid reserved keyword conflicts
    FilterExpression: '(contains(username, :q) OR contains(#nm, :q)) AND username <> :cu',
    ExpressionAttributeNames: { '#nm': 'fullname' }, // <-- CHANGED TO fullname
    ExpressionAttributeValues: { 
      ':q': query.toLowerCase(),
      ':cu': currentUsername 
    },
    Limit: 10,
  };
  const result = await dynamoDB.scan(params).promise();
  
  return result.Items.map(u => ({
    id: u.username,
    name: u.fullname || u.username,
    handle: `@${u.username}`,
  }));
};

const getDetailedUsers = async (usernames) => {
  if (!usernames || usernames.length === 0) return [];
  
  const keys = usernames.map(u => ({ PK: `USER#${u}`, SK: 'PROFILE' }));
  const params = { RequestItems: { [TABLE]: { Keys: keys } } };
  
  const result = await dynamoDB.batchGet(params).promise();
  
  return result.Responses[TABLE].map(u => ({
    id: u.username,
    name: u.fullname || u.username, // <-- Safely map fullname to name for the frontend
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

  user.friendRequests = (user.friendRequests || []).filter(req => req !== senderUsername);
  
  if (!(user.friends || []).includes(senderUsername)) {
    user.friends = [...(user.friends || []), senderUsername];
  }

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