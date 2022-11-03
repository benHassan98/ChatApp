require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const CreateMessage = require("./utils/CreateMessage");
const GetMessages = require("./utils/GetMessages");
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
    console.log("newUser: ", userName, room, socket.id);
    const user = {
      id: socket.id,
      userName,
      rooms: [room],
    };
    const message = {
      senderId: "ChatBot",
      room,
      isPublic: true,
      content: `${userName} joined the Room`,
    };
    if (!roomsLists[room]) roomsLists[room] = [];
    roomsLists[room].push(user);
    usersInfo[socket.id] = user;

    await CreateMessage(message);

    socket.join(room);
    io.sockets.in(room).emit("chatUsers", roomsLists[room]);
    io.sockets.in(room).emit("newMessage", message);
    console.log("newUser END", socket.id);
  });
  socket.on("getAllUsers", () => {
    console.log("getAllUsers", socket.id);
    const allUsersNames = Object.entries(usersInfo).map((user) => user[1]);

    socket.emit("chatUsers", allUsersNames);
    console.log("getAllUsers END", socket.id);
  });
  socket.on("getAllRooms", () => {
    console.log("getAllRooms", socket.id);
    const allRooms = Object.entries(roomsLists).map((room) => room[0]);
    socket.emit("getAllRooms", allRooms);
  });

  socket.on("joinRoom", async (room) => {
    console.log("joinRoom", room, socket.id);
    if (!roomsLists[room]) {
      roomsLists[room] = [];
      socket.broadcast.emit("newRoom", room);
    }
    const message = {
      senderId: "ChatBot",
      room,
      isPublic: true,
      content: `${usersInfo[socket.id].userName} joined the Room`,
    };

    joinRoom(socket.id, room);
    roomsLists[room].push(usersInfo[socket.id]);
    await CreateMessage(message);
    socket.join(room);
    io.sockets.in(room).emit("chatUsers", roomsLists[room]);
    io.sockets.in(room).emit("newMessage", message);
    console.log("joinRoom END", socket.id);
  });

  socket.on("leaveRoom", async (room) => {
    console.log("leaveRoom", room, socket.id);
    const message = {
      senderId: "ChatBot",
      room,
      isPublic: true,
      content: `${usersInfo[socket.id].userName} left the Room`,
    };
    leaveRoom(socket.id, room);
    roomsLists[room] = roomsLists[room].filter((user) => user.id !== socket.id);
    await CreateMessage(message);
    socket.leave(room);
    io.sockets.in(room).emit("chatUsers", roomsLists[room]);
    io.sockets.in(room).emit("newMessage", message);
    console.log("leaveRoom END", socket.id);
  });

  socket.on("newMessage", async (message) => {
    console.log("newMessage", message, socket.id);
    await CreateMessage(message);
    if (!message.isPublic) {
      socket.to(message.receiverId).emit("newMessage", message);
    } else {
      socket.to(message.room).emit("newMessage", message);
    }

    console.log("newMessage END", socket.id);
  });

  socket.on("getMessages", async (room, isPublic, userId) => {
    console.log("getMessages", room, isPublic, socket.id, userId);
    const messages = await GetMessages(room, isPublic, socket.id, userId);

    socket.emit("getMessages", messages);
    console.log("getMessages END", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("disconnect: ", socket.id);
    usersInfo[socket.id]?.rooms.forEach((room) => {
      roomsLists[room] = roomsLists[room].filter(
        (user) => user.id !== socket.id
      );
      socket.leave(room);
      socket.to(room).emit("chatUsers", roomsLists[room]);
      socket.to(room).emit("newMessage", {
        senderId: "ChatBot",
        room,
        isPublic: true,
        content: `${usersInfo[socket.id].userName} has disconnected`,
      });
    });
    io.emit('newMessage',{
      userId: socket.id,
      userName: usersInfo[socket.id].userName,
      isDisconnected: 1,
    });
    delete usersInfo[socket.id];
  });
});

module.exports = io;
