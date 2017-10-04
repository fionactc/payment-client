## Payment App using PayPal and BrainTree
This is a web application that allows user to make direct payment through PayPal or BrainTree. 

Live Demo: [HERE](https://enigmatic-wildwood-29590.herokuapp.com/)
*May take a while to start up both server and client

Server Repo: [HERE](https://github.com/fionactc/payment-server)

Client Repo: [HERE](https://github.com/fionactc/payment-client)

### Data Structure
Payment record on Redis contains:

|| description | type
|---|---|---
| key | Payment ID from PayPal or BrainTree | String
| value | Payment information | Object (Stringify when saved to Redis)

Payment Information Object:

|attribute | type |
|---|---|
|firstName | String |
|lastName | String |
|phone | String |
|currency | String |
|amount | String |


### Technical Choices
- ReactJS: for frontend view
- Node.js: Javascript on server side
- Express: Web Framework for Node
- Redis: Key/Value pair data storage
- PayPal REST API
- BrainTree Javascript SDK

### Running this app
A `.env` file for server code like the following is needed:
```
BRAINTREE_MERCHANT_ID=<id>
BRAINTREE_PUBLIC_KEY=<public_key>
BRAINTREE_PRIVATE_KEY=<private_key>
PAYPAL_CLIENT=<client_key>
PAYPAL_SECRET=<secret>
```
This file is not hosted on github for security reason.
A Redis database is also needed on local machine.

### Trade-offs discussion
As required, this app should decide whether to pay through PAYPAL or BRAINTREE with credit card. However, after going through PayPal documentation, it seems that it now encourages direct credit card payment with BrainTree instead of using PayPal. PayPal Node SDK github previously contains an example for paying with credit card but it is now removed. (See this [Stackoverflow](https://stackoverflow.com/questions/38921540/how-do-i-make-a-direct-payment-using-paypal-rest-in-node)).

In order to reach the requirement, this solution uses a custom form to collect user data and credit card, then send to the server code and then send to PayPal. The down sides to this approach is that sending user's credit card to our own server seems to be violating security compliance for handling payment data. It is also difficult to use predesigned forms from PayPal or BrainTree which could save us a lot of trouble in security, validation etc. This solution simply uses `POST` request and SSL to pass data between server and client. Due to time constraint I did not investigate more on enhancing security.

Also PayPal somehow rejects American Express card and I could not find the corresponding configuration. I leave the logic for using PayPal for AMEX in the code but in this version it would return error from server.

Other possible improvements to this solution include:
- Better form validation
- Upgrade REDIS tier on Heroku so that it could persist payment record
- Further breakdown React module and uses Redux store for stateless module
