import React from "react";
import "./build/App.css";
import Login from "./components/login";
import Room from "./components/room";
import Nav from "./components/nav";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";
import Cookies from "universal-cookie";
export const socket = io.connect("http://localhost:4000");
export const cookies = new Cookies();
export function getRoomID() {
  return window.location.href.split("/")[4];
}
export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      accessToken: cookies.get("accessToken"),
      username: cookies.get("username") ? cookies.get("username") : "No Username",
      loggedIn: false,
    };
  }
  componentDidMount() {
    console.log(this.state);
  }
  updateUsername = ({ target }) => {
    if (target.value.length > 12) return;
    this.setState({ username: target.value });
    cookies.set("username", target.value);
  };
  updateAccessToken = (tok) => {
    this.setState({ accessToken: tok });
    if (!tok) cookies.remove("accessToken");
    else cookies.set("accessToken", tok);
  };
  updateLoggedIn = (state) => {
    this.setState({ loggedIn: state });
  };
  render() {
    return (
      <Router>
        <div className="App">
          <Nav />
          <Switch>
            <Route path="/room/">
              <Room
                username={this.state.username}
                accessToken={this.state.accessToken}
                loggedIn={this.state.loggedIn}
                updateLoggedIn={this.updateLoggedIn}
              ></Room>
            </Route>
            <Route path="/">
              <Login
                accessToken={this.state.accessToken}
                updateAccessToken={this.updateAccessToken}
                username={this.state.username}
                updateUsername={this.updateUsername}
                loggedIn={this.state.loggedIn}
                updateLoggedIn={this.updateLoggedIn}
              />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}
