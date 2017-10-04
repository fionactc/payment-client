import React, { Component } from 'react';
import Navigation from './Navigation';

class SuccessPayment extends Component {
  render() {
    let id = this.props.location.state.payment.id;
    let payment = this.props.location.state.payment.paymentRecord;
    return (
      <div className="success">
        <Navigation />

        <h3>Your payment is successful</h3>

        <div className="row">
          <div className="col-xs-3"><strong>Payment ID:</strong></div>
          <div className="col-xs-9">{id}</div>
        </div>

        <div className="row">
          <div className="col-xs-3"><strong>First Name:</strong></div>
          <div className="col-xs-9">{payment.firstName}</div>
        </div>

        <div className="row">
          <div className="col-xs-3"><strong>Last Name:</strong></div>
          <div className="col-xs-9">{payment.lastName}</div>
        </div>

        <div className="row">
          <div className="col-xs-3"><strong>Currency:</strong></div>
          <div className="col-xs-9">{payment.currency}</div>
        </div>

        <div className="row">
          <div className="col-xs-3"><strong>Amount:</strong></div>
          <div className="col-xs-9">{payment.amount}</div>
        </div>
        
      </div>
    )
  }
}

export default SuccessPayment;
