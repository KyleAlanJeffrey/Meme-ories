import React, { Component } from "react";

class GameHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let startButton = false, roundInfo = false;
    if (this.props.dataLoaded) {
      startButton = this.props.myUser.lead && this.props.roomInfo.state == "lobby";
      roundInfo = this.props.roomInfo.running;
    }

    return (
      <div className="game-board-header row">
        <div className="col-2 offset-5">
          {startButton && (
            <button className="btn host-btn slide-in" onClick={this.props.startGame}>
              Start Game
            </button>
          )}
          {roundInfo && <h1 className="round-title slide-in">Round {this.props.roomInfo.round}</h1>}
        </div>
      </div>
    );
  }
}
export default GameHeader;
