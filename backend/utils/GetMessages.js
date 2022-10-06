const Message = require("../models/message");
const GetMessages = async (room, isPublic, socketId, userId) => {
  const messages = await Message.find({ room, isPublic });
  if (isPublic) return messages;
  else
    return messages.filter(
      (message) =>
        (message.senderId === socketId && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === socketId)
    );
};
module.exports = GetMessages;
