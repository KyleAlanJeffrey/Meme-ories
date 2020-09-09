import React, { Component } from "react";
import PlayerListItem from "./playerListItem";
class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="player-list">
        <h1>Users</h1>
        {this.props.usersData.map((userData, index) => (
          <PlayerListItem highlight={userData.chosen} key={"player " + index} username={userData.username} profilePic={userData.profilePic} userData={userData}></PlayerListItem>
        ))}
      </div>
    );
  }
}

export default PlayerList;
