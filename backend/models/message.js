const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  senderId: String,
  senderName:String,
  receiverId: String,
  receiverName:String,
  room: String,
  isPublic:Boolean,
  content: String,
  createdAt: Date,
});

module.exports = mongoose.model("RealTimeMessage", MessageSchema);
