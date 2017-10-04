// helper for converting currency
// TODO: in the future, uses real time exchange rate OR configure multiple BrainTree merchant account to accept different currencies

let fx = require('money');
fx.base = 'USD';
fx.rates = {
  'CNY': 6.64279688,
  'JPY': 113.083795,
  'HKD': 7.8116456
};

export default fx;
