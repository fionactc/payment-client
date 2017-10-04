import React, { Component } from 'react';

class Lightbox extends Component {
  render() {
    return (
      <a href="#_" className="lightbox" id="lightbox" onClick={this.props.reset}>
        <h2>
          {this.props.message}
        </h2>
      </a>
    )
  }
}
export default Lightbox;
