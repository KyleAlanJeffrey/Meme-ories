import React, { Component } from "react";
import { Answer } from "./answer";

export class Answers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return this.props.usersData.map((userData, index) => (userData.answer !== null ? <Answer key={"answer " + index} userData={userData} myUser={this.state.myUser} /> : null));
  }
}
