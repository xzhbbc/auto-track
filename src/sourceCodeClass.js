import React, { Component } from "react";
// import _entLog2 from "@/core/entLog";
const logFilter = "test_logs";

class Index extends Component {
  componentDidMount() {
    this.test();
  }

  test = () => {
    console.log("test");
  };

  onClick = () => {
    console.log("click");
  };

  open = () => {
    console.log("open");
  };

  render() {
    <>
      <div onClick={this.onClick}>test</div>
      <div onClick={this.open}>open</div>
    </>;
  }
}

export default Index;
