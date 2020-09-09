const fetch = require("node-fetch");
const { Lobby } = require("./States");
let line = 0;
class User {
  constructor(username, profilePic, accesstoken, fbID) {
    this.username = username;
    this.profilePic = profilePic;
    this.accessToken = accesstoken;
    this.fbID = fbID;
    this.id = Room.createID();
    this.lead = false;
    this.answer = null;
    this.upvotes = 0;
    this.downvotes = 0;
    this.chosen = false;
    this.albumIDs = null;
    this.photoIDs = null;
  }
  getPublic() {
    return { username: this.username, profilePic: this.profilePic };
  }
  async loadAlbumIDs() {
    const url = `https://graph.facebook.com/v8.0/${this.fbID}/albums?access_token=${this.accessToken}`;
    let res = await fetch(url);
    if (res.status != 200) {
      throw console.log(
        `\n\n:::::ERROR: Fetching Album ID's::::: \n -- Status Code: ${res.status} - ${res.statusText} -- \n\n -------> Try logging out and back into facebook!\n\n`
      );
    }
    this.albumIDs = await res.json();
    this.albumIDs = this.albumIDs.data;

    // console.log("ALBUM IDS--------------");
    // console.log(this.albumIDs);
    return Promise.resolve();
  }
  async loadAlbum(id) {
    let res = await fetch(`https://graph.facebook.com/v8.0/${id}/photos?access_token=${this.accessToken}`);
    const photoIDs = await res.json();
    this.photoIDs = photoIDs.data;
    // console.log('Photo IDS--------------');
    // console.log(this.photoIDs);

    return Promise.resolve();
  }
  async loadRandomAlbum() {
    const r = this.getRandomAlbumID();
    await this.loadAlbum(r);
    return Promise.resolve();
  }
  getRandomAlbumID() {
    const cap = this.albumIDs.length;
    if (!cap) {
      console.log("No album IDs for user");
      return;
    }
    const rng = Math.floor(cap * Math.random());
    return this.albumIDs[rng].id;
  }
  async getRandomPic() {
    if (this.albumIDs == null) {
      await this.loadAlbumIDs();
    }
    if (this.photoIDs == null) {
      await this.loadRandomAlbum();
    }
    const cap = this.photoIDs.length;
    const rng = Math.floor(cap * Math.random());
    const picID = this.photoIDs[rng].id;
    const pic = await fetch(`https://graph.facebook.com/v8.0/${picID}?fields=source&access_token=${this.accessToken}`);
    return await pic.json();
  }
}

class Round {
  constructor(num) {
    this.number = num;
    this.votes = 0;
    this.image = null;
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
      round: new Round(1),
    };
  }
  async parseUserEvent(data, socket) {
    console.log(`${line}:Recieving --${data.event}-- event`);
    line++;
    switch (data.event) {
      case "joinedGame": {
        this.addUser(new User(data.userData.username, data.userData.profilePic, data.userData.accessToken, data.userData.fbID));
        socket.join(this.id);
        // if (line == 1) this.addFakeUsers();
        this.sendGameMessage("loadGame", { usersData: this.users, roomInfo: this.roomInfo });
        break;
      }
      case "leftGame": {
        this.removeUser(data.userData.id);
        socket.leave(this.id);
        if (data.lead) this.users[0].lead = true;
        this.sendGameMessage("userLeft", { userData: data.userData });
        break;
      }
      case "startGame": {
        this.roomInfo.running = true;
        this.roomInfo.state = "submitting";
        this.roomInfo.state = "choosePlayer";
        const user = this.randomSelect();
        user.chosen = true;
        const pic = await user.getRandomPic();
        this.roomInfo.round.image = pic;
        this.sendGameMessage("startRound", { usersData: this.users, roomInfo: this.roomInfo });
        break;
      }
      case "submitAnswer": {
        const user = this.getUser(data.userData.id);
        user.answer = data.answer;
        if (this.roomInfo.round.answers == this.users.length) {
          this.roomInfo.state = "voting";
          this.sendGameMessage("loadGame", { usersData: this.users, roomInfo: this.roomInfo });
          setTimeout(() => {
            this.roomInfo.state = "endRound";
            this.sendGameMessage("loadGame", { usersData: this.users, roomInfo: this.roomInfo });
          }, 25000);
        }
        break;
      }
      case "submitVote": {
        const userVoted = this.getUser(data.userVotedData.id);
        if (data.vote == "up") userVoted.upvotes++;
        if (data.vote == "down") userVoted.downvotes++;
        this.sendGameMessage("loadGame", { usersData: this.users, roomInfo: this.roomInfo });
        break;
      }
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
      usersPublic.push(user.getPublic());
    });
  }
  addFakeUsers() {
    this.addUser(new User(Math.random(), null, null));
    this.addUser(new User(Math.random(), null, null));
    this.addUser(new User(Math.random(), null, null));
    this.addUser(new User(Math.random(), null, null));
    this.addUser(new User(Math.random(), null, null));
  }
  addUser(username, profilePic, accessToken, fbID) {
    this.users.push(new User(username, profilePic, accessToken, fbID));
    if (this.users.length == this.ROOM_SIZE) this.full = true;
    if (this.users.length == 1) user.lead = true;
  }
  removeUser(id) {
    this.users = this.users.filter((user) => {
      return user.id != id;
    });
  }
  sendGameMessage(event, data) {
    console.log(`${line}:Sending --${event}-- event`);
    line++;
    this.io.to(this.id).emit(event, data);
  }
  sendGameData() {
    console.log(`${line}:Sending --loadGame-- event`);
    line++;
    this.io.to(this.id).emit("loadGame", { usersData: this.users, roomInfo: this.roomInfo });
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
