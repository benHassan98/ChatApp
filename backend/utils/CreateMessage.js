const Message = require("../models/message");

exports = async ({ sender, reciver, room, content }) => {
  const newMessage = new Message({
    sender,
    reciver,
    room,
    content,
    createdAt: new Date.now(),
  });

  await newMessage.save();

  return newMessage;
};
