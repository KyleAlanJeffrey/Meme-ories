import React, { Component } from "react";
import { socket, getRoomID } from "../App";
const thumbsUp = require("../img/thumbsUp.png");
export class Answer extends Component {
  constructor(props) {
    super(props);
    this.state = { reactionClasses: " hide", reactionShow: false, voteSubmitted: false, answerClasses: " " };
  }
  handleEvent = (event) => {
    switch (event.type) {
      case "click": {
        if (this.state.reactionShow) this.setState({ reactionClasses: " hide", reactionShow: false, answerClasses: " " });
        else this.setState({ reactionClasses: " show", reactionShow: true, answerClasses: " active" });
        break;
      }
      default: {
        console.log("no handler for " + event.type + " event");
      }
    }
  };
  handleReaction(event, value, userData) {
    if (this.state.voteSubmitted) return;
    console.log("-----Voted for------");
    console.log(userData);
    this.setState({ voteSubmitted: true, reactionShow: false, reactionClasses: " hide" });
    if (value === "up") {
      this.sendServerMessage("submitVote", {
        userVotedData: userData,
        userVotingData: this.props.myUser,
        vote: "up",
      });
    } else {
      this.sendServerMessage("submitVote", {
        userVotedData: userData,
        userVotingData: this.props.myUser,
        vote: "down",
      });
    }
  }
  sendServerMessage = (event, data) => {
    socket.emit("userEventMessage", { ...data, event: event, roomID: getRoomID() });
  };
  render() {
    const userData = this.props.userData;
    return (
      <div className="answer" style={{ top: userData.answer.y, left: userData.answer.x }}>
        <div className={"text-container" + this.state.answerClasses} onClick={this.handleEvent}>
          <span>{userData.answer.content}</span>
        </div>
        <div className={"reactions" + this.state.reactionClasses}>
          <div className="up">
            <img
              src={thumbsUp}
              onClick={(event) => {
                this.handleReaction(event, "up", userData);
              }}
            ></img>
          </div>
          <div className="down">
            <img
              src={thumbsUp}
              onClick={(event) => {
                this.handleReaction(event, "down", userData);
              }}
            ></img>
          </div>
        </div>
      </div>
    );
  }
}
