import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Navigation extends Component {
  render() {
    return (
      <ul className="nav nav-pills">
        <li role="presentation" >
          <Link to="/">Payment Form</Link>
        </li>

        <li role="presentation" >
          <Link to="/record">Payment Record</Link>
        </li>
      </ul>
    )
  }
}

export default Navigation;
