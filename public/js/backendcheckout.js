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