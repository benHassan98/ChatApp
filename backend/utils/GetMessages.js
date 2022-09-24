const Message = require("../models/message");
const GetMessages = async (room, isPublic, socketId) => {
  const messages = await Message.find({ room, isPublic });
  if (isPublic) return messages;
  else
    return messages.filter(
      (message) =>
        message.senderId === socketId || message.receiverId === socketId
    );
};
module.exports = GetMessages;
