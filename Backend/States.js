
class State {
  constructor(io, room, state) {
    this.io = io;
    this.room = room;
    this.state = state;
  }
  parseMessage(data, socket) {
    console.log(` :Recieving --${data.event}-- event`);
    switch (data.event) {
      case "joinedGame": {
        // this.room.addUser(new User(data.userData.username, data.userData.profilePic, data.userData.accessToken, data.userData.fbID));
        socket.join(this.id);
        this.room.sendGameData();
      }
    }
  }
  switchState(io, room, state) {
    switch (state) {
      case "lobby": {
        this.room.state = new Lobby(io, room);
        break;
      }
      case "roundStart": {
        this.room.state = new roundStart(io, room);
        break;
      }
      case "chooseUser": {
        this.room.state = new chooseUser(io, room);
        break;
      }
    }
  }
}
class Lobby extends State {
  constructor(io, room) {
    super(io, room, "lobby");
  }
  parseMessage(data, socket) {
    super.parseMessage(data, socket);
    switch (data.event) {
      case "startGame": {
        break;
      }
    }
  }
}
class ChooseUser extends State {
  constructor(io, room) {
    super(io, room, "chooseUser");
  }
  parseMessage(data, socket) {
    super.parseMessage(data, socket);
    switch (data.event) {
    }
  }
}
module.exports = { State, Lobby, ChooseUser };
