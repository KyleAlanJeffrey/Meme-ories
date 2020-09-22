let line = 0;
class State {
  constructor(io, room, state) {
    this.io = io;
    this.room = room;
    this.state = state;
  }
  parseMessage(data, socket) {
    console.log(`${line}:Recieving --${data.event}-- event`);
    line++;
    switch (data.event) {
      case "joinedGame": {
        const user = this.room.addUser(data.accessToken, data.username, data.fbInfo);
        socket.join(this.room.id);
        this.room.sendGameData();
        user.loadRandomAlbum(); // load photos on entry
        break;
      }
      case "leftGame": {
        const user = this.room.removeUser(data.userData.id);
        socket.leave(this.room.id);
        this.room.sendGameMessage("userLeft", { userData: user });
        break;
      }
    }
  }
  startTimer(seconds, state) {
    let s = seconds;
    const interval = setInterval(() => {
      s--;
      if (!s) {
        clearInterval(interval);
        this.end(state);
      }
    }, 1000);
  }
}
class Lobby extends State {
  constructor(io, room) {
    super(io, room, "lobby");
  }
  async parseMessage(data, socket) {
    super.parseMessage(data, socket);
    switch (data.event) {
      case "startGame": {
        this.room.state = new ChooseUser(this.io, this.room);
        this.room.state.start();
        break;
      }
    }
  }
}
class RoundStart extends State {
  constructor(io, room) {
    super(io, room, "roundStart");
  }
  start() {}
}
class ChooseUser extends State {
  constructor(io, room) {
    super(io, room, "chooseUser");
    room.roomInfo.running = true;
    room.roomInfo.state = "chooseUser";
    room.roomInfo.round++;
    this.chosenUser = null;
  }
  start() {
    const user = this.room.randomSelect();
    user.chosen = true;
    this.chosenUser = user;
    this.room.sendGameData();
    super.startTimer(2, "submitting");
  }
  end(state) {
    this.room.state = new Submitting(this.io, this.room);
    this.room.state.start(this.chosenUser);
  }
}
class Submitting extends State {
  constructor(io, room) {
    super(io, room, "submitting");
    room.roomInfo.state = "submitting";
    this.answers = 0;
  }
  parseMessage(data, socket) {
    super.parseMessage(data, socket);
    switch (data.event) {
      case "submitAnswer": {
        const user = this.room.getUser(data.userData.id);
        user.answer = data.answer;
        this.answers++;
        this.room.sendGameData();
        if (this.answers === this.room.users.length + 1) this.end();
        break;
      }
      case "submitVote": {
        const userVoted = this.room.getUser(data.userVotedData.id);
        if (data.vote == "up") userVoted.upvotes++;
        if (data.vote == "down") userVoted.downvotes++;
        this.room.sendGameData();
        break;
      }
    }
  }
  async start(user) {
    const pic = await user.getRandomPic();
    this.room.roomInfo.image = pic;
    this.room.sendGameData();
  }
  end() {
    this.room.state = new ChooseUser(this.io, this.room);
    this.room.state.start();
  }
}
module.exports = { State, Lobby, ChooseUser };
