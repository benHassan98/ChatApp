const mongoose = require('mongoose');
const {Schema} = mongoose;

const MessageSchema = new Schema({
sender:String,
reciver:String,
room:String,
content:String,
createdAt:Date
});


module.exports = mongoose.model('RealTimeMessage',MessageSchema);

