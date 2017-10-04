import React, { Component } from 'react';
import axios from 'axios';

import './App.css';

let dropin = require('braintree-web-drop-in');
let braintree = require('braintree-web');

const CLIENT_TOKEN = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiI1NzBiODM0ZjE1NTQzZDNlZWU0MDljMDRhY2MxODM1ZWY5OTNiZGI0YWZkYWM1NTg4ODhmNWI2OWQ0YTc1NGE0fGNyZWF0ZWRfYXQ9MjAxNy0xMC0wM1QwNToxOTo1NS44MjA3MjY3MzkrMDAwMFx1MDAyNm1lcmNoYW50X2lkPXB6OWt2Y2N4cGhiZnlrcnFcdTAwMjZwdWJsaWNfa2V5PXc3ZGp3bXZ2a2RzYjhqOG4iLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvcHo5a3ZjY3hwaGJmeWtycS9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzL3B6OWt2Y2N4cGhiZnlrcnEvY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tL3B6OWt2Y2N4cGhiZnlrcnEifSwidGhyZWVEU2VjdXJlRW5hYmxlZCI6dHJ1ZSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1lIjoiRnJlZWxhbmNlciIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50SWQiOiJtYXN0ZXJjbGllbnQzIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjp0cnVlLCJtZXJjaGFudEFjY291bnRJZCI6ImZyZWVsYW5jZXIiLCJjdXJyZW5jeUlzb0NvZGUiOiJVU0QifSwibWVyY2hhbnRJZCI6InB6OWt2Y2N4cGhiZnlrcnEiLCJ2ZW5tbyI6Im9mZiJ9";

let paymentClient;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCustomerDetailsFilled: true,
      isPaymentFormLoaded: false
    }
  }

  componentDidMount() {
    let submitBtn = document.querySelector("#submit-button");
    
    dropin.create({
      authorization: CLIENT_TOKEN,
      container: '#dropin-container',
      paymentOptionPriority: ['card', 'paypal'],
      card: {
        cardholderName: true,
      }
    }, (err, clientInstance)=>{
      if (err) {
        console.error(err);
        return;
      }
      paymentClient = clientInstance;
      console.log(clientInstance);
    })
    
  }

  validateCustomerDetails = ()=>{
    // TODO: validate input
    // proceed to payment detail form
    this.setState({ isCustomerDetailsFilled: true })
  }

  render() {
    return (
      <div className="app">
        <h2>Customer Details</h2>
        {
          !this.state.isCustomerDetailsFilled && 
          <form>
            <div className="form-group">
              <label for="first_name">First Name</label>
              <input type="text" className="form-control" ref="first_name" />
            </div>

            <div className="form-group">
              <label for="last_name">Last Name</label>
              <input type="text" className="form-control" ref="last_name" />
            </div>


            <div className="form-group">
              <label for="phone">Currency</label>
              <select className="form-control" ref="currency">
                <option value="HKD">HKD</option>
                <option value="USD">USD</option>
                <option value="AUD">AUD</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
              </select>
            </div>

            <div className="form-group">
              <label className="" for="exampleInputAmount">Amount (in dollars)</label>
              <div className="input-group">
                <div className="input-group-addon">$</div>
                <input type="text" className="form-control" id="exampleInputAmount" placeholder="Amount" ref="amount" />
                <div className="input-group-addon">.00</div>
              </div>
            </div>

            <button className="btn btn-primary"
              onClick={this.validateCustomerDetails}>
              Next: Payment method
            </button>
          </form>
        }
        {
          this.state.isCustomerDetailsFilled &&
            <div className="payment-form">
              <div id="paypal-button">
              </div>
              <div id="dropin-container">
              </div>
              <button id="submit-button" 
                className="btn btn-default"
                onClick={this.onPaymentSubmit}
              >Pay</button>
            </div>
        }
      </div>
    );
  }
}

export default App;
