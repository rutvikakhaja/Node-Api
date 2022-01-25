const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('../models/socketUsers');

const { generateMessage } = require('../utils/message');

const socketConnection = async (socket) => {
  console.log('**************', socket.handshake.query.token);
  // Authenticate socket
  try {
    await promisify(jwt.verify)(
      socket.handshake.query.token,
      process.env.JWT_SECRET
    );
  } catch (err) {
    socket.emit('error', 'Unauthorized!');
    socket.disconnect(true);
    return;
  }
  socket.on('join', ({ username, room, id }, callback) => {
    const { error, user } = addUser({
      socketId: socket.id,
      username,
      room,
      id,
    });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit('message', generateMessage('System', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('System', `${user.username} has joined!`)
      );
    global.io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on('typing', () => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('typing', {
        username: user.username,
      });
    }
  });

  socket.on('stop-typing', () => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('stop-typing', {
        username: user.username,
      });
    }
  });

  socket.on('clear-canvas', (data) => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('clear-canvas', {
        username: user.username,
        data,
      });
    }
  });
  console.log('socket..1234.....', socket.id);
  socket.on('canvas', (data) => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('canvas', {
        username: user.username,
        data,
      });
    }
  });

  socket.on('audio', (data) => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('audio', {
        username: user.username,
        data,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('disconnected...........');
    const user = removeUser(socket.id);
    if (user) {
      global.io
        .to(user.room)
        .emit(
          'message',
          generateMessage('System', `${user.username} has left!`)
        );
      global.io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
    console.log('socket disconnected...', socket.id);
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      global.io.to(user.room).emit('message', {
        username: user.username,
        id: message.id,
        message: message.message,
        createdAt: message.createdAt,
      });
    }
  });
};

module.exports = { socketConnection };
