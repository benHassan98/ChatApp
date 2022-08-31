require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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
io.on("connection", (socket) => {
  console.log(`User ${socket.id} is connected`);
  socket.on("newUser", (userName, room) => {
if(!roomsLists[room])roomsLists[room] = [];
roomsLists[room].push(userName);
socket.join(room);


  });
});

module.exports = server;
