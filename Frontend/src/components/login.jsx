import React, { Component } from "react";
import "../build/Login.css";
import FacebookLogin from "react-facebook-login";
import { socket, cookies } from "../App";
import { withRouter } from "react-router";
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fbInfo: { id: null, profilePicture: null, accessToken: null, name: "Not Signed In", loggedIn: false },
    };
  }
  componentDidMount(){
    socket.emit("getUserData", { accessToken: this.props.accessToken }, (serverData) => {
      if(serverData.error){
        console.log('No User Data found from stored accessToken. Might be expired!');
        cookies.remove('accessToken');
      }else{
        this.setState({fbInfo:{accessToken:serverData.fbAccessToken, name: serverData.name, profilePicture: serverData.fbPictureURL, loggedIn: true}})        
        this.props.updateAccessToken(serverData._id);
      }
      console.log(serverData);
    });

  }
  responseFacebook = (response) => {
    if (response.status === "unknown") {
      console.log("Error loading facebook data!");
    } else {
      console.log(response);
      this.setState({
        fbInfo: {
          name: response.name,
          profilePicture: response.picture.data.url,
          id: response.id,
          loggedIn: true,
          accessToken: response.accessToken,
        },
      });
      socket.emit("createUserData", this.state.fbInfo, (serverData) => {
        cookies.set("accessToken", serverData.accessToken);
      });
    }
  };
  logout = () => {
    console.log("Logging");
    cookies.remove("accessToken");
  };
  findGame = () => {
    socket.emit("findGame", this.state, (data) => {
      this.props.history.push("/room/" + data.roomID);
    });
  };
  componentDidUpdate() {
    if (this.state.fbInfo.loggedIn) {
      document.getElementsByClassName("fb-login-button")[0].textContent = "Logged In";
      document.getElementsByClassName("fb-login-button")[0].setAttribute("disabled", "true");
    } else {
      document.getElementsByClassName("fb-login-button")[0].textContent = "Login with Facebook";
      document.getElementsByClassName("fb-login-button")[0].removeAttribute("disabled");
    }
  }
  render() {
    let logoutClasses = "hidden";
    if (this.state.fbInfo.loggedIn) {
      logoutClasses = "";
    }
    return (
      <div className="login-page">
        <div className="login-dashboard container">
          <div className="row">
            <h1 className="title">Login</h1>
          </div>
          <div className="row">
            <div className="col-md-7">
              <div className="login-info container-fluid">
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <h2>Username</h2>
                  <input
                    style={{ fontSize: "30px" }}
                    className="form-control"
                    onChange={this.props.updateUsername}
                    value={this.props.username}
                  ></input>
                </form>
                <button
                  to={"/room/"}
                  onClick={() => {
                    this.findGame();
                  }}
                  id="findPublicGameButton"
                  className="btn btn-lg btn-success my-2 w-fill"
                >
                  Find Public Game
                </button>
                <button
                  onClick={() => {
                    this.findGame();
                  }}
                  className="btn btn-lg btn-success w-fill"
                >
                  Create Private Game
                </button>
              </div>
            </div>
            <div className="col-md-5">
              <div className="facebook-connect container-fluid">
                <img id="fb-photo" alt="FB Profile Pic" src={this.state.fbInfo.profilePicture}></img>
                <h2 style={{ margin: "0 0 15px 0" }}>{this.state.fbInfo.name}</h2>
                <FacebookLogin
                  appId="3307740772625784"
                  autoLoad={false}
                  fields="name,email,picture"
                  callback={this.responseFacebook}
                  cssClass="btn btn-success fb-login-button"
                />
                <div className={"btn btn-md btn-danger m-2 " + logoutClasses} onClick={this.logout}>
                  Logout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
