import React, { Component } from "react";
const dots = require("../img/dots.png");
export class InputField extends Component {
  constructor(props) {
    super(props);
    this.state = { answer: "none", mouseDown: false, position: { x: 0, y: 0 }, boardOffset: { x: 0, y: 0 }, inputWidth: 300, inputOpacity: 1 };
  }
  componentDidMount() {
    window.addEventListener("mousemove", this.handleEvent);
  }
  onSubmit = (event) => {
    event.preventDefault();
    const offsetX = this.state.position.x - this.state.boardOffset.x - this.state.inputWidth / 2;
    const offsetY = this.state.position.y - this.state.boardOffset.y + 15;
    this.props.onSubmit({ content: this.state.answer, x: offsetX, y: offsetY });
    this.setState({ inputWidth: 150, inputOpacity: 0 });
  };
  onChangeInput = ({ target }) => {
    this.setState({ answer: target.value });
  };
  handleEvent = (event) => {
    if (event.type === "mousedown") {
      this.setState({ mouseDown: true });
    } else if (event.type === "mouseup") {
      this.setState({ mouseDown: false });
    } else if (event.type === "mousemove") {
      if (this.state.mouseDown) {
        const board = document.getElementsByClassName("game-board")[0];
        this.setState({
          position: { x: event.pageX, y: event.pageY },
          boardOffset: { x: board.offsetLeft, y: board.offsetTop },
        });
      }
    }
  };

  render() {
    const offsetX = this.state.position.x - this.state.boardOffset.x - this.state.inputWidth / 2;
    const offsetY = this.state.position.y - this.state.boardOffset.y + 15;
    return (
      <form
        className={"form " + this.props.classes}
        onSubmit={this.onSubmit}
        style={{ top: offsetY, left: offsetX, width: this.state.inputWidth, opacity: this.state.inputOpacity }}
      >
        <input className={"form-control"} onChange={this.onChangeInput} value={this.state.answer} />
        <button type="button" onClick={this.onSubmit} className="btn ">
          Submit
        </button>
        <a className="drag" onMouseDown={this.handleEvent} onMouseUp={this.handleEvent}>
          <img src={dots} draggable={false}></img>
        </a>
      </form>
    );
  }
}
