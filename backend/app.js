require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const CreateMessage = require("./utils/CreateMessage");
const GetMessages = require("./utils/GetMessages");
const mongoose = require("mongoose");
const app = express();

if (process.env.NODE_ENV === "production") {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

app.use(cors());
app.use(logger("dev"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.REACT_APP,
  },
});
const roomsLists = {};
const usersInfo = {};
const joinRoom = (userId, room) => {
  usersInfo[userId].rooms.push(room);
  return true;
};
const leaveRoom = (userId, room) => {
  usersInfo[userId].rooms = usersInfo[userId].rooms.filter(
    (curRoom) => curRoom !== room
  );
  return true;
};

io.on("connection", (socket) => {
  console.log(`User ${socket.id} is connected`);
  socket.on("newUser", async (userName, room) => {
    console.log("in newUser: ",socket.id);
    const user = {
      id: socket.id,
      userName,
      rooms: [room],
    };
    const message = {
      senderId: "ChatBot",
      room,
      isPublic:true,
      content: `${userName} joined the Room`,
    };
    if (!roomsLists[room]) roomsLists[room] = [];
    roomsLists[room].push(user);
    usersInfo[socket.id] = user;

    await CreateMessage(message);

    socket.join(room);
    io.sockets.in(room).emit("chatUsers", roomsLists[room]);
    io.sockets.in(room).emit("newMessage", message);
  });
  socket.on("joinRoom", async (room) => {
    if (!roomsLists[room]) roomsLists[room] = [];
    const message = {
      senderId: "ChatBot",
      room,
      isPublic:true,
      content: `${usersInfo[socket.id].userName} joined the Room`,
    };

    joinRoom(socket.id, room);
    roomsLists[room].push(usersInfo[socket.id]);
    await CreateMessage(message);
    socket.join(room);
    io.sockets.in(room).emit("chatUsers", roomsLists[room]);
    io.sockets.in(room).emit("newMessage", message);
  });

  socket.on("leaveRoom", async (room) => {
    const message = {
      senderId: "ChatBot",
      room,
      isPublic:true,
      content: `${usersInfo[socket.id].userName} left the Room`,
    };
    leaveRoom(socket.id, room);
    roomsLists[room] = roomsLists[room].filter((user) => user.id !== socket.id);
    await CreateMessage(message);
    socket.leave(room);
    io.sockets.in(room).emit("chatUsers", roomsLists[room]);
    io.sockets.in(room).emit("newMessage", message);
  });

  socket.on("newMessage", async (room, message) => {
    await CreateMessage(message);
    if (message.isPublic) {
      socket.to(room).emit("newMessage", message);
    } else {
      socket.to(message.reciverId).emit("newMessage", message);
    }
  });

  socket.on("getMessages", async (room, isPublic) => {
    const messages = await GetMessages(room,isPublic,socket.id);
  
    socket.emit("getMessages", messages);
  });

  socket.on("disconnect", () => {
    console.log("disconnect: ", socket.id);
    usersInfo[socket.id].rooms.forEach(async (room) => {
      roomsLists[room] = roomsLists[room].filter(
        (user) => user.id !== socket.id
      );
      socket.to(room).emit("chatUsers", roomsLists[room]);
      socket.leave(room);
    });

    delete usersInfo[socket.id];
  });
});

module.exports = io;
