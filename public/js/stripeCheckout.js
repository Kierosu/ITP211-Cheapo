// var handler = StripeCheckout.configure({
//   key: 'pk_test_xaN8YLYB6jMqtqfguHvjft8f',
//   image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
//   locale: 'auto',
//   token: function(token) {
//     // You can access the token ID with `token.id`.
//     var stripeToken = token.id; 
//     // Get the token ID to your server-side code for use.
//   }
// });

// document.getElementById('customButton').addEventListener('click', function(e) {
//   // Open Checkout with further options:
//   handler.open({
//     name: 'Cheapo Online Shop',
//     description: '2 widgets',
//     currency: 'sgd',
//     amount: 2000
//   });
//   e.preventDefault();
// });

// //Close Checkout on page navigation:
// window.addEventListener('popstate', function() {
//   handler.close();
// });