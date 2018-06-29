$(document).ready(function(){      
    $('#paypal-button-container').slideUp(); //enter the class or id of the particular html element which you wish to hide. 
    $(".stripe").slideUp("slow");
});

$("input[name='payment']").click(function ()
        {
            if (document.getElementById('paypal').checked)
            {
                //Paypal radio button is checked
                $(".stripe").slideUp("slow");
                $('#paypal-button-container').slideDown();

            }
            else if (document.getElementById('card').checked)
            {
                //Card radio button is checked
                $(".stripe").slideDown("slow");
                $('#paypal-button-container').slideUp();
            }
            ;
        });

// var selectedCardIcon = null;
// // credit card
// var cleaveCreditCard = new Cleave('.input-credit-card', {
//     creditCard:              true,
//     onCreditCardTypeChanged: function (type) {
//         type = type.split('15')[0];
        
//         if (selectedCardIcon) {
//             DOM.removeClass(selectedCardIcon, 'active');
//         }

//         selectedCardIcon = DOM.select('.icon-' + type);

//         if (selectedCardIcon) {
//             DOM.addClass(selectedCardIcon, 'active');
//         }
//     }
// });

// var btnClear = DOM.select('.btn-clear');
// var creditCardInput = DOM.select('.input-credit-card');
// creditCardInput.addEventListener('focus', function () {
//     DOM.removeClass(btnClear, 'hidden-right');
// });
// btnClear.addEventListener('click', function () {
//     cleaveCreditCard.setRawValue('');
//     DOM.addClass(btnClear, 'hidden-right');
//     creditCardInput.focus();
// });