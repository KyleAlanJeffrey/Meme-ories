import React, { Component } from "react";
import { InputField } from "./inputField";
import { FBImage } from "./fbImage";
import { Answers } from "./answers";
class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = { classes: " slide-up" };
  }
  submit = (answer) => {
    this.props.onSubmit(answer);
  };
  componentWillUpdate() {
    if (this.props.roomInfo.state === "endRound") {
      this.setState({ classes: "slide-down" });
      setTimeout(() => {
        this.setState({ classes: " slide-up" });
      }, 1600);
    }
  }
  render() {
    return (
      <div className={"game-board" + this.state.classes}>
        {this.props.fbImage !== null ? <FBImage src={this.props.fbImage} /> : null}
        <Answers usersData={this.props.usersData} myUser={this.state.myUser} /> 
        {this.props.roomInfo.state === "submitting" ? <InputField classes="game-input" onSubmit={this.submit}></InputField> : null}
      </div>
    );
  }
}

export default GameBoard;
