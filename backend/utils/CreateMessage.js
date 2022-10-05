const Message = require("../models/message");
const CreateMessage = async ({
  senderId,
  senderName,
  receiverId,
  room,
  isPublic,
  content,
}) => {
  try {
    const newMessage = new Message({
      senderId,
      senderName,
      receiverId,
      room,
      isPublic: isPublic ?? true,
      content,
      createdAt: Date.now(),
    });
    await newMessage.save();

    return newMessage;
  } catch (e) {
    console.log(e);
  }
};

module.exports = CreateMessage;
