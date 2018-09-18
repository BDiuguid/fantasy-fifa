import React, { Component } from 'react';

class Catch extends Component {
  state = {
    hasError: false,
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    console.log('error');
    console.log(error);
    console.log('info');
    console.log(info);
  }

  render() {
    return this.state.hasError ? (
      <h1>Something went wrong. Please Refresh the page!</h1>
    ) : (
      this.props.children
    );
  }
}

export default Catch;
