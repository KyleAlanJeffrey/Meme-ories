import React, { Component } from 'react';

export class Button extends Component {
    constructor(props) {
        super(props);
        this.state = {id: Math.random()};
    }
    onClick = (event)=>{
        event.preventDefault();
        this.props.onClick();
    }
    render() { 
        let classnames = `btn`;
        return (<button type="button" id={this.state.id} onClick={this.onClick} className={classnames}>{this.props.text}</button>  );
    }
}
 