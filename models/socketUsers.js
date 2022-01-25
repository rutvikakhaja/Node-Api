//This model handles all connected uses in memory

const users = [];

const addUser = ({ socketId, username, room, id }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate username and room
  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  // Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  //validate username
  if (existingUser) {
    return {
      error: 'Username is in use!',
    };
  }

  // store user
  const user = { socketId, username, room, id };
  users.push(user);
  return { user };
};

const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (socketId) => users.find((user) => user.socketId === socketId);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
