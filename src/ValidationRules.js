import React from 'react';
import Validation from 'react-validation';
import validator from 'validator';

Object.assign(Validation.rules, {
  required: {
    rule: value => {
      return value.toString.trim()
    },
    hint: value => {
      return <span className="form-error is-visible">Required</span>
    },
    phone: {
      rule: value => {
        return validator.isMobilePhone(value, 'any')
      },
      hint: value => {
        return <span className="form-error is-visible">Phone number is invalid</span>
      }
    },
    countryCode: {
      rule: value => {
        return validator.isByteLength(value, {min: 2, max: 2})
      },
      hint: value => {
        return <span className="form-error is-visible">Enter 2 Charcter ISO 3166 Code</span>
      }
    },
    creditCard: {
      rule: value => {
        return validator.isCreditCard(value)
      },
      hint: value => {
        return <span className="form-error is-visible">Invalid Credit Card Number</span>
      }
    },
    month: {
      rule: value => {
        let num = Number(value);
        return num > 0 && num < 13;
      },
      hint: value => {
        return <span className="form-error is-visible">Enter a number between 1-12</span>
      }
    },
    year: {
      rule: value => {
        return validator.isByteLength(value.toString(), { min: 2, max: 2 }) &&
          validator.isNumeric(value)
      },
      hint: value => {
        return <span className="form-error is-visible">Enter year in YY format</span>
      }
    },
    cvv: {
      rule: value => {
        return validator.isByteLength(value.toString(), { min: 3, max: 4 }) &&
          validator.isNumeric(value)
      },
      hint: value => {
        return <span className="form-error is-visible">Enter valid CVV value</span>
      }
    },
    api: {
      hint: value => {
        <button className="form-error is-visible">
          API Error on "{value}" value.
        </button>
      }
    }
  }
})
