import React, { Component } from 'react';
import axios from 'axios';

import Navigation from './Navigation';

class PaymentRecord extends Component {
  constructor(props) {
    super(props);
    this.state = { record: '' }
  }

  searchRecord = (e)=>{
    e.preventDefault();
    axios.post('http://localhost:8000/record', {
      first_name: this.refs.first_name.value,
      last_name: this.refs.last_name.value,
      id: this.refs.id.value
    }).then((result)=>{
      if (result.status === 200)
        this.setState({ record: result.data })
    })
  }

  render() {
    return (
      <div className="record">

        <Navigation />

        <h2>Search for payment record</h2>
        <form>
          <div className="form-group">
            <label >First Name</label>
            <input type="text" className="form-control" ref="first_name" />
          </div>

          <div className="form-group">
            <label >Last Name</label>
            <input type="text" className="form-control" ref="last_name" />
          </div>

          <div className="form-group">
            <label >Payment ID</label>
            <input type="text" className="form-control" ref="id" />
          </div>

          <button className="btn btn-default" onClick={this.searchRecord} >Search</button>
        </form>

        {
          this.state.record && 
            <div>
              <h3>Result</h3>
              <table className="table">
                <tbody>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone Number</th>
                    <th>Currency</th>
                    <th>Price</th>
                  </tr>
                  <tr>
                    <td>{ this.state.record.firstName + ' ' + this.state.record.lastName }</td>
                    <td>{this.state.record.phone}</td>
                    <td>{this.state.record.currency}</td>
                    <td>{this.state.record.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        }

      </div>
    )
  }
}

export default PaymentRecord;
