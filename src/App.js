import React, { Component } from 'react';
import { Form, Text, Select, FormError } from 'react-form'
import { Redirect } from 'react-router-dom';
import validator from 'validator';
import axios from 'axios';
import './App.css';

import Navigation from './Navigation';
import Lightbox from './Lightbox';

let createClient = require('braintree-web/client').create;
let creditCardType = require('credit-card-type');

let fx = require('./fx');

const CARD_TYPE_MAP = {
  'visa'            : 'visa',
  'master-card'     : 'mastercard',
  'american-express': 'amex',
  'jcb'             : 'jcb',
  'discover'        : 'discover'
}

const ROOT_URL = 'http://localhost:8000';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentResult: '',
      errorMessage: '',
      isFormSubmitting: false
    }
  }

  payWithPayPal = (cardType, values)=>{
    console.log('Paying with PayPal...')

    let creditCard = {
      "credit_card": {
        "type": CARD_TYPE_MAP[cardType],
        "number": values.card_number,
        "expire_month": values.expiry_month,
        "expire_year": '20' + values.expiry_year,
        "cvv2": values.cvv,
        "first_name": values.first_name,
        "last_name": values.last_name,
        "billing_address": {
          "line1": values.address,
          "city": values.city,
          "postal_code" : values.postal_code,
          "country_code": values.country_code
        }
      }
    }

    axios.post('http://localhost:8000/paypal/checkout', { 
        creditCard,
        amount: values.amount,
        currency: values.currency,
        phone: values.number
    }).then((result)=>{
      this.setState({ paymentResult: result.data, isFormSubmitting: false })
    }).catch((err)=>{
      this.setState({ errorMessage: 'Error: ' + err.response.data, isFormSubmitting: false })
    })
  }

  payWithBrainTree = (values)=>{
    console.log('Paying with BrainTree...')

    let data = {
      creditCard: {
        number: values.card_number,
        cvv: values.cvv,
        expirationDate: values.expiry_month + '/' + values.expiry_year,
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
              let nonce = response.creditCards[0].nonce;

              let amount = fx.convert(values.amount, 
                { from: values.currency, to: 'USD'})
              amount = Math.round(amount*100)/100;

              let customer = {
                first_name: values.first_name,
                last_name: values.last_name,
                phone: values.number
              }

              axios.post('http://localhost:8000/braintree/checkout', {
                nonce,
                amount,
                customer
              }).then((result)=>{
                this.setState({ paymentResult: result.data, isFormSubmitting: false })
              }).catch((err)=>{
                this.setState({ errorMessage: 'Error: ' + err.response.data, isFormSubmitting: false })
              })
          }
        })
      })
    })
  }

  submitPayment = (values)=>{
    this.setState({ isFormSubmitting: true })
    let cardType = creditCardType(values.card_number)[0].type;

    if (cardType === 'american-express' && values.currency !== 'USD') {

      this.setState({ 
        errorMessage: 'Error: American Express card can only be used to pay USD', 
        isFormSubmitting: false
      })

    } else if (values.currency === 'USD' || 
      values.currency === 'EUR' || values.currency === 'AUD' ) {
      this.payWithPayPal(cardType, values);
    } else {
      this.payWithBrainTree(values);
    }
  }

  validateForm = (values) => {
    const { first_name, last_name, number, currency, amount, address, city, postal_code, 
      country_code, card_number, expiry_month, expiry_year, cvv } = values;

    return {
      first_name: !first_name ? 'Name is required' : undefined,
      last_name: !last_name ? 'Name is required' : undefined,
      number: !number ? 'Phone number is required' : 
        ( validator.isMobilePhone(number, 'any') ? undefined : 'Invalid Phone number' ),
      currency: !currency ? 'Please choose on currency' : undefined,
      amount: !amount ? 'Please enter an amount' : undefined,
      address: !address ? 'Address is required' : undefined,
      city: !city ? 'City is required' : undefined,
      postal_code: !postal_code ? 
      'Postal code is required' : (validator.isByteLength(postal_code.toString(), { min: 5, max: 5}) ?
        undefined : 'Postal code must be 5 digits') ,
      country_code: !country_code ?
        'Country code is required' : ( validator.isByteLength(country_code, {min: 2, max: 2}) ?
        undefined: 'Enter 2 character ISO 3166 Code'),
      card_number: !card_number ?
        'Card number is required': ( !validator.isCreditCard(card_number) ?
        'Card number is invalid' : undefined),
      expiry_month: !expiry_month ?
        'Expiry Month is undefined' : ( Number(expiry_month) > 0 && Number(expiry_month) < 13 && validator.isByteLength(expiry_month.toString(), { min: 2, max: 2}) ?
        undefined : 'Enter a number between 01-12'),
      expiry_year: !expiry_year ?
        'Expiry Year is undefined' : (
          validator.isByteLength(expiry_year.toString(), { min: 2, max: 2 } && Number(expiry_year) > 16 
          ? undefined : 'Enter year in YY format' )),
      cvv: !cvv ? 'CVV is required' : ( validator.isByteLength(cvv.toString(), {min:3, max: 4}) ?
        undefined : 'Enter 3 or 4 digits CVV')
    }

  }

  resetError = ()=>{
    this.setState({ errorMessage: '' })
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
        { this.state.errorMessage &&
          <Lightbox message={this.state.errorMessage} reset={this.resetError} />
        }
        <Form
          onSubmit={this.submitPayment}
          validate={this.validateForm}
        >
          { ({submitForm})=>{
            return (
              <form onSubmit={submitForm}>

                <div className="form-group">
                  <label>First Name</label>
                  <Text field="first_name" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <Text field="last_name" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Mobile Phone Number</label>
                  <Text field="number" type="number" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <Select
                    className="form-control"
                    field='currency'
                    options={[
                      { label: 'HKD', value: 'HKD' },
                      { label: 'USD', value: 'USD' },
                      { label: 'AUD', value: 'AUD' },
                      { label: 'EUR', value: 'EUR' },
                      { label: 'JPY', value: 'JPY' },
                      { label: 'CNY', value: 'CNY' },
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <Text type="number" className="form-control" field="amount" />
                </div>

                <h3>Billing Address</h3>

                <div className="form-group">
                  <label>Address</label>
                  <Text field="address" className="form-control" />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <Text field="city" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Postal Code</label>
                  <Text type="number" field="postal_code" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Country Code</label>
                  <Text field="country_code" className="form-control" placeholder="e.g. US"/>
                </div>

                <h3>Credit Card Information</h3>

                <div className="form-group">
                  <label>Card Number</label>
                  <Text field="card_number" type="number" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Expiry Month (MM)</label>
                  <Text field="expiry_month" type="number" className="form-control" />
                </div>

                <div className="form-group">
                  <label>Expiry Year (YY)</label>
                  <Text field="expiry_year" type="number" className="form-control" />
                </div>

                <div className="form-group">
                  <label>CVV (3 or 4 digits)</label>
                  <Text field="cvv" type="number" className="form-control" />
                </div>

                { this.state.isFormSubmitting &&
                  <p className="tip">Submitting...Please do not refresh</p>
                }
                <button type="submit" className={ 'btn btn-default ' + (this.state.isFormSubmitting ? ' disabled' : '' )}>Submit</button>

              </form>
            )
          }}
        </Form>
      </div>
    )
  }
}

export default App;
