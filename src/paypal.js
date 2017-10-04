import React, { Component } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import { Redirect } from 'react-router-dom';
// import Validation from 'react-validation';
// import './ValidationRules';

import { Form, Text, Select, FormError } from 'react-form'
import './App.css';

let createClient = require('braintree-web/client').create;
let creditCardType = require('credit-card-type');

const ROOT_URL = 'http://localhost:8000';

let fx = require('money');
fx.base = 'USD';
fx.rates = {
  'CNY': 6.64279688,
  'JPY': 113.083795,
  'HKD': 7.8116456
};

const CARD_TYPE_MAP = {
  'visa': 'visa',
  'master-card': 'mastercard',
  'american-express': 'amex',
  'jcb': 'jcb',
  'discover': 'discover'
}


class PayPal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentResult: ''
    };
  }

  onSubmit = (e)=>{
    e.preventDefault();
    //TODO: validation
    let cardType = creditCardType(this.refs.card_number.value)[0].type;
    console.log('this is cardType', cardType);
    
    // find out credit card type
    let currency = this.refs.currency.value;
    console.log('this is currency', currency);

    if (cardType === 'american-express' && currency !== 'USD') {
      // error
      console.log('REJECTED')
    } else if (currency === 'USD' || currency === 'EUR' || currency === 'AUD' ) {
      // use paypal
      this.payWithPayPal(cardType, currency);
    } else {
      // use BrainTree
      this.payWithBrainTree();
    }
  }

  payWithPayPal = (cardType, currency)=>{
    console.log('Paying with PayPal...')

    let creditCard = {
      "credit_card": {
        "type": CARD_TYPE_MAP[cardType],
        "number": this.refs.card_number.value,
        "expire_month": this.refs.expiry_month.value,
        "expire_year": '20' + this.refs.expiry_year.value,
        "cvv2": this.refs.cvv.value,
        "first_name": this.refs.first_name.value,
        "last_name": this.refs.last_name.value,
        "billing_address": {
          "line1": this.refs.address.value,
          "city": this.refs.city.value,
          "country_code": this.refs.country_code.value
        }
      }
    }

    axios.post('http://localhost:8000/paypal/checkout', { 
        creditCard,
        amount: this.refs.amount.value,
        currency,
        phone: this.refs.phone_number.value
    }).then((result)=>{
      console.log('this is result from paypal')
      console.log(result);
      // this.setState({ isPaymentSuccess: true })
      this.setState({ paymentResult: result.data })
    }).catch((err)=>{
      console.log('Error');
      console.log(err);
    })
  }
  
  successRedirect = ()=>{
    console.log('this is context', this.context.router);
  }

  payWithBrainTree = ()=>{
    console.log('Paying with BrainTree...')

    let data = {
      creditCard: {
        number: this.refs.card_number.value,
        cvv: this.refs.cvv.value,
        expirationDate: this.refs.expiry_month.value + '/' + this.refs.expiry_year.value,
      },
      options: {
        validate: false
      }
    }

    axios.get(`${ROOT_URL}/braintree/token`)
      .then((result)=>{
        let CLIENT_TOKEN
        if (result.status === 200 && result.data)
          CLIENT_TOKEN = result.data;

        // TODO: error

        createClient({
          authorization: CLIENT_TOKEN
        }, (err, clientInstance)=>{
          clientInstance.request({
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
            data: data
          }, (err, response)=>{
            if (err) console.log(err);
            else {
              console.log('Got nonce', response);

              let nonce = response.creditCards[0].nonce;

              let amount = fx.convert(this.refs.amount.value, 
                { from: this.refs.currency.value, to: 'USD'})
              amount = Math.round(amount*100)/100;

              let customer = {
                first_name: this.refs.first_name.value,
                last_name: this.refs.last_name.value,
                phone: this.refs.phone_number.value
              }

              axios.post('http://localhost:8000/braintree/checkout', {
                nonce,
                amount,
                customer,
                originalCurrency: this.refs.currency.value
              }).then((result)=>{
                console.log(result); 
                // this.setState({ isPaymentSuccess: true })
                this.setState({ paymentResult: result.data })
              })
          }
        })
      })
    })
  }

  render() {
    if (this.state.paymentResult) {
      return (
        <Redirect to={{
          pathname: '/success',
          state: { payment: this.state.paymentResult }
        }} />
      )
    }

    return (
      <div className="app">
        <Navigation />
        <h2>Payment</h2>
        <Form
          onSubmit={(values)=>{
            console.log('values', values);
          }}
        >
          { ({submitForm})=>{
            return (
              <form onSubmit={submitForm}>
                <Text field="name" />
                <button type="submit">Submit</button>

              </form>
            )
          }}
        </Form>
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
            <label >Phone Number</label>
            <input type="number" className="form-control" ref="phone_number" />
          </div>

          <div className="form-group">
            <label >Currency</label>
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
            <label className="" >Amount (in dollars)</label>
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

        <form>
          <h3>Billing address</h3>

          <div className="form-group">
            <label >Address</label>
            <input type="text" className="form-control" ref="address" />
          </div>

          <div className="form-group">
            <label >City</label>
            <input type="text" className="form-control" ref="city" />
          </div>

          <div className="form-group">
            <label >Country Code</label>
            <input type="text" className="form-control" ref="country_code" />
          </div>

          <h3>Credit Card Information</h3>

          <div className="form-group">
            <label >Card Number</label>
            <input type="number" className="form-control" ref="card_number" />
          </div>

          <div className="form-group">
            <label >Expiry Month</label>
            <input type="number" className="form-control" ref="expiry_month" />
          </div>

          <div className="form-group">
            <label >Expiry Year</label>
            <input type="number" className="form-control" ref="expiry_year" />
          </div>

          <div className="form-group">
            <label >CVV</label>
            <input type="number" className="form-control" ref="cvv" />
          </div>

          <button onClick={this.onSubmit} className="btn btn-default" >Pay</button>
        </form>

      </div>
    )
  }

}

export default PayPal;
