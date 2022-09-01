require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { CreateMessage } = require("./utils/CreateMessage");
const { GetMessages } = require("./utils/GetMessages");
const app = express();

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
let messages, messagesPrivate;
io.on("connection", (socket) => {
  console.log(`User ${socket.id} is connected`);
  socket.on("newUser", async (userName, room) => {
    const user = {
      id: socket.id,
      userName,
      rooms: [room],
      joinRoom: (room) => {
        this.rooms.push(room);
        return true;
      },
      leaveRoom: (room) => {
        this.rooms = this.rooms.filter((curRoom) => curRoom !== room);
        return true;
      },
    };
    const message = {
      sender: "ChatBot",
      room,
      content: `${userName} joined the Room`,
    };
    if (!roomsLists[room]) roomsLists[room] = [];
    roomsLists[room].push(user);
    usersInfo[socket.id] = user;

    await CreateMessage(message);
    messages.push(message);
    socket.join(room);
    socket.to(room).emit("chatUsers", roomsLists[room]);
    socket.to(room).emit("newMessage", message);
  });
  socket.on("joinRoom", async (room) => {
    const message = {
      sender: "ChatBot",
      room,
      content: `${usersInfo[socket.id].userName} joined the Room`,
    };
    usersInfo[socket.id].joinRoom(room);
    roomsLists[room].push(usersInfo[socket.id]);
    await CreateMessage(message);
    messages.push(message);
    socket.join(room);
    socket.to(room).emit("chatUsers", roomsLists[room]);
    socket.to(room).emit("newMessage", message);
  });

  socket.on("leaveRoom", async (room) => {
    const message = {
      sender: "ChatBot",
      room,
      content: `${usersInfo[socket.id].userName} left the Room`,
    };
    usersInfo[socket.id].leaveRoom(room);
    roomsLists[room] = roomsLists[room].filter((user) => user.id !== socket.id);
    await CreateMessage(message);
    messages.push(message);
    socket.leave(room);
    socket.to(room).emit("newMessage", message);
  });

  socket.on("newMessage", async (room, message) => {
    if (message.room === "private") messagesPrivate.push(message);
    else messages.push(message);

    await CreateMessage(message);

    socket.to(room).emit("chatUsers", roomsLists[room]);
  });

  socket.on("getMessages", async (room, isPublic) => {
    if (!messages) {
      const allMessages = await GetMessages(room);
      messages = allMessages.filter((message) => message.room !== "private");
      messagesPrivate = allMessages.filter(
        (message) => message.room === "private"
      );
    }
    const responseMessages = isPublic ? messages : messagesPrivate;
    socket.to(room).emit("getMessages", responseMessages);
    socket.to(room).emit("chatUsers", roomsLists[room]);
  });

  socket.on("disconnect", () => {
    const message = {
      sender: "ChatBot",
      room,
      content: `${usersInfo[socket.id].userName} disconnected from the Chat`,
    };
    usersInfo[socket.id].rooms.forEach(async (room) => {
      roomsLists[room] = roomsLists[room].filter(
        (user) => user.id !== socket.id
      );
      socket.to(room).emit("chatUsers", roomsLists[room]);
      socket.to(room).emit("newMessage", message);
      await CreateMessage(message);
      socket.leave(room);
    });

    delete usersInfo[socket.id];
  });
});

module.exports = server;
