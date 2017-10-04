import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import PaymentRecord from './PaymentRecord';
import SuccessPayment from './SuccessPayment';
import PayPal from './paypal';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/record" component={PaymentRecord}></Route>
      <Route path="/success" component={SuccessPayment}></Route>
      <Route path="/" component={App}></Route>
    </Switch>
  </BrowserRouter>
, document.getElementById('root'))
registerServiceWorker();
// <Route path="/" component={PayPal}></Route>
