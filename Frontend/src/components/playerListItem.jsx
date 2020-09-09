import React, { Component } from "react";
import thumbsUp from "../img/thumbsUp.png";
class PlayerListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let classes = "player-list-item";
    if (this.props.highlight) classes += " highlight";
    return (
      <div className={classes}>
        <img alt="profile pic" className="player-profile-pic" src={this.props.profilePic}></img>
        <span className="name">{this.props.username}</span>
        <div className="votes">
          <div className="upvote">
            <div className="score">{this.props.userData.upvotes}</div>
            <img src={thumbsUp}></img>
          </div>
          <div className="downvote">
          <div className="score">{this.props.userData.downvotes}</div>
            <img src={thumbsUp}></img>
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerListItem;
