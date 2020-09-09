import React, { Component } from "react";
import { Link } from "react-router-dom";

class Nav extends Component {
  render() {
    return (
      <nav className="navbar app-nav">
        <span href="/" className="navbar-brand mb-0">
          <Link to="/">Meme-ories</Link> 
        </span>
      </nav>
    );
  }
}

export default Nav;
