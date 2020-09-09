import React, { Component } from "react";

export class FBImage extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="fb-image">
        <img alt="fb thing from fb" src={this.props.src} draggable={false}></img>
      </div>
    );
  }
}
