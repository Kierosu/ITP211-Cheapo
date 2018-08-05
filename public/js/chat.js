$(function(){
    //make connection
    var socket = io.connect('http://localhost:4000/chat');

    //buttons and inputs
    var message = $("#message");
    var sentto = $("#name");  
	var username = $("#username");
	var send_message = $("#send_message");
  
	var chatroom = $("#chatroom");
	var feedback = $("#feedback");
 


    //Emit message
    send_message.click(function(){
     
        socket.emit('new_message',message.val()   ) 
        mssage.val('');
        
    }) 
  

    //Listen on new_message
    socket.on("messagenew", function(data)   {
        // feedback.html('');
        // message.val(''); 
        console.log(data.msg)
        chatroom.append("<p class='message'>" + data.msg + "</p>")
        
    })

    
    
    //Emit typing
    message.bind("keypress", () => {
         socket.emit('typing')
    })
    
    //Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})  ;    
});
 
