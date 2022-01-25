const generateMessage = (username, message) => ({
    username,
    message,
    createdAt: Date.now(),
  });
  
  module.exports = {
    generateMessage,
  };
  