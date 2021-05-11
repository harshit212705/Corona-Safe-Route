import React, { Component } from "react";
import Form from "./Form.jsx";

export default class SideBar extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    return (
      <div>
        <Form onFindRouteButtonClicked={this.props.handleFindDirections} />
      </div>
    );
  }
}
