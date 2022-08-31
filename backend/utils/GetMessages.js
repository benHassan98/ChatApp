const Message = require("../models/message");

exports = async (roomName) => {
  const messages = await Message.find({ room: roomName });
  return messages;
};
