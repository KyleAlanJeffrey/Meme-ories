const express = require("express");
const app = express(),
  // cookieParser = require("cookie-parser"),
  server = require("http").createServer(app),
  io = require("socket.io")(server),
  mongoose = require("mongoose"),
  { RoomList } = require("./Classes"),
  UserData = require("./models/User");
require("dotenv/config");

// app.use(cookieParser());
server.listen(4000, () => {
  console.log("Listening on Port " + 4000 + "...");
});
//Database, all the options are to fix deprecation warnings
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
  console.log("Connected to Database...");
});
// Sockets
const rooms = new RoomList();
io.on("connection", (socket) => {
  socket.on("getUserData", async (data, callback) => {
    if (!data.accessToken) {
      callback({ error: { message: "no access token provided" } });
    } else {
      const userData = await UserData.findById(data.accessToken);
      if (!userData) {
        callback({ error: { message: "User Not Found. Data Might've Expired" } });
      } else {
        console.log("DB::::Sending User Data from database!::::");
        callback(userData);
      }
    }
  });
  socket.on("createUserData", async (data, callback) => {
    const userData = new UserData({
      fbID: data.id,
      fbAccessToken: data.accessToken,
      fbPictureURL: data.profilePicture,
      name: data.name,
    });
    userData.save((err) => {
      if (err) {
        throw console.log(`DB::::Error Creating User ${err}::::`);
      } else {
        console.log("DB::::Created new User on database!::::");
        console.log(userData);
      }
    });
    callback({ accessToken: userData._id });
  });
  socket.on("findGame", (data, callback) => {
    let room = rooms.findOpenRoom();
    if (!room) room = rooms.addRoom(data.isPrivate, io);
    callback({ roomID: room.id });
  });
  socket.on("userEventMessage", (data) => {
    const room = rooms.getRoomByID(data.roomID);
    if (!room) socket.emit("redirect", "/");
    else room.state.parseMessage(data, socket);
  });
});
