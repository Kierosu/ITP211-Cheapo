$(function(){
    //make connection
    var socket = io.connect('http://localhost:3000/')

    //buttons and inputs
    var message = $("#message") 
    var sentto = $("#name")  
	  var username = $("#username")
	  var send_message = $("#send_message")
    var chat = $("#chat");
	  var chatroom = $("#chatroom")
	  var feedback = $("#feedback")
 


    //Emit message
    send_message.click(function(){
     
        socket.emit('new_message', {message : message.val() ,sentby : username.val() , sentto : sentto.val()}   )
     
    }) 
     
    chat.click(function(){
     
        socket.emit('chat', { username : username.val() }   )
     
    })

    //Listen on new_message
    socket.on("new_message", (data) => {
        feedback.html('');
        message.val('');
        chatroom.append("<p class='message'>" + data.message + "</p>")
        
    })

    
    
    //Emit typing
    message.bind("keypress", () => {
         socket.emit('typing')
    })
    
    //Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})      
});
