const fetch = require("node-fetch");
const { Lobby } = require("./States");
const UserData = require("./models/User");
const { throwErrorMessage } = require("./Functions");
let line = 0;
class User {
  constructor(accessToken, username, fbInfo) {
    this.id = Room.createID();
    this.username = username;
    this.accessToken = accessToken;
    this.fbInfo = { id: fbInfo.fbID, accessToken: fbInfo.fbAccessToken, profilePicture: fbInfo.fbPictureURL, name: fbInfo.name };
    this.lead = false;
    this.answer = null;
    this.upvotes = 0;
    this.downvotes = 0;
    this.chosen = false;
    this.photosLoaded = false;
  }
  getPublicData() {
    return {
      username: this.username,
      profilePic: this.fbInfo.profilePicture,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      chosen: this.chosen,
      lead: this.lead,
      answer: this.answer,
      id: this.id,
    };
  }
  async loadRandomAlbum() {
    /// SHOULD EVENTUALLY CHECK IF USER ALREADY HAS AN ALBUM LOADED
    const url = `https://graph.facebook.com/v8.0/${this.fbInfo.id}/albums?fields=count,name,description&access_token=${this.fbInfo.accessToken}`;
    let res = await fetch(url);
    if (res.status != 200) {
      throw console.log(
        `\n\n:::::ERROR: Fetching Album ID's::::: \n -- Status Code: ${res.status} - ${res.statusText} -- \n\n -------> Try logging out and back into facebook!\n\n`
      );
    }
    const albums = await res.json();
    const albumsFiltered = albums.data.filter((album) => {
      return album.count > 5;
    });
    const cap = albumsFiltered.length;
    const rng = Math.floor(cap * Math.random());
    const albumID = albumsFiltered[rng].id;
    await this.loadAlbum(albumID);
  }
  async loadAlbum(id) {
    let res = await fetch(`https://graph.facebook.com/v8.0/${id}/photos?fields=link,name,backdated_time&access_token=${this.fbInfo.accessToken}`);
    const photos = await res.json();
    UserData.updateOne({ _id: this.accessToken }, { fbPictures: photos.data }, (err, res) => {
      if (err) throwErrorMessage("db", "ERROR: Updating Facebook Photos", err);
      console.log("DB::::Loaded Album:::::");
      this.photosLoaded = true;
    });
  }
  async getRandomPic() {
    //check if already has fb pictures loaded, if not, load them,
    // NEED TO REMOVVE THE PHOTO FROM DATABASE
    const dbUserData = await UserData.findById(this.accessToken, (err, dbUserData) => {
      if (err) throwErrorMessage("db", "ERROR: Getting Facebook Photo", err);
    });
    const pictureArray = dbUserData.fbPictures;
    console.log(pictureArray);
    const cap = pictureArray.length;
    const rng = Math.floor(cap * Math.random());
    const pictureID = pictureArray[rng].id;
    // This fetch returns several formats of image
    const picRAW = await fetch(`https://graph.facebook.com/v8.0/${pictureID}?fields=images&access_token=${this.fbInfo.accessToken}`);
    const picArray = await picRAW.json();
    return Promise.resolve(picArray.images[0]);
  }
}

class Room {
  constructor(id, isPrivate, io) {
    this.id = id;
    this.private = isPrivate;
    this.full = false;
    this.io = io;
    this.users = [];
    this.ROOM_SIZE = 8;
    this.state = new Lobby(io, this);
    this.roomInfo = {
      state: "lobby",
      running: false,
      round: 0,
      image: null,
    };
  }
  async parseUserEvent(data, socket) {
    console.log(`${line}:Recieving --${data.event}-- event`);
    line++;
    switch (data.event) {


    }
  }
  randomSelect() {
    const cap = this.users.length;
    const userIndex = Math.floor(cap * Math.random());
    return this.users[userIndex];
  }
  getUser(id) {
    return this.users.find((user) => {
      return user.id == id;
    });
  }
  getUsersPublic() {
    const usersPublic = [];
    this.users.forEach((user) => {
      usersPublic.push(user.getPublicData());
    });
    return usersPublic;
  }
  addUser(accessToken, username, fbInfo) {
    const user = new User(accessToken, username, fbInfo);
    this.users.push(user);
    if (this.users.length == this.ROOM_SIZE) this.full = true;
    if (this.users.length == 1) user.lead = true;
    return user;
  }
  removeUser(id) {
    const user = this.getUser(id);
    this.users = this.users.filter((user) => {
      return user.id != id;
    });
    if (user.lead && this.users.length != 0) this.users[0].lead = true;
    return user.getPublicData();
  }
  sendGameMessage(event, data) {
    console.log(`${line}:Sending --${event}-- event`);
    line++;
    this.io.to(this.id).emit(event, data);
  }
  sendGameData() {
    console.log(`${line}:Sending --loadGame-- event`);
    line++;
    this.io.to(this.id).emit("loadGame", { usersData: this.getUsersPublic(), roomInfo: this.roomInfo });
  }
  static createID() {
    let A = 65;
    let Z = 90;
    let roomCode = "";
    for (let i = 0; i < 4; i++) {
      let ch_code = Math.floor((Z - A) * Math.random()) + A;
      let ch = String.fromCharCode(ch_code);
      roomCode += ch;
    }
    return roomCode;
  }
  joinable() {
    return !this.roomInfo.running && !this.private && !this.full && this.users.length <= this.ROOM_SIZE;
  }
  print() {
    console.log(
      `***********************\nRoom ID: ${this.id}\nPrivate Room: ${this.private}\nJoinable: ${this.joinable()}\nPlayers: ${
        this.users.length
      }\n***********************`
    );
  }
}
class RoomList {
  constructor() {
    this.roomList = {};
  }
  getRoomByID(id) {
    let room = this.roomList[id];
    if (room == undefined) room = false;
    return room;
  }
  addRoom(privateRoom, io) {
    // Generate unique room code and check if it's unique
    let id = Room.createID();
    while (this.getRoomByID(id)) {
      id = Room.createID();
    }
    let room = new Room(id, privateRoom, io);
    this.roomList[id] = room;
    console.log(`--------Creating new room for Ext ${id}-------- `);
    return room;
  }
  findOpenRoom() {
    for (let id in this.roomList) {
      if (this.roomList[id].joinable()) return this.roomList[id];
    }
    return false;
  }
  print() {
    console.log("----------------------------\n\tROOMS LIST\n----------------------------");
    const rooms = Object.values(this.roomList);
    rooms.forEach((room) => {
      room.print();
    });
  }
}
module.exports = { User, Room, RoomList };
