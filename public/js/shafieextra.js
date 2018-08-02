function HideorShow(){
    var x = document.getElementById("chat"); 
    
    if (x.style.display === "none"){
        x.style.display = "block";
    }else{
        x.style.display = "none";
    }
}  

function ShowChatButton(){ 
    var y = document.getElementById("chatbutton");   
    var z = document.getElementById("chat"); 
    if (y.style.display === "none"){
        y.style.display = "block";  
        z.style.display = "none"; 
    } 
}
 
$('.hide-chat-box').click(function(){
    $('.chat-content').slideToggle();
});
