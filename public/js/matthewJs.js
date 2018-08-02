function dTimer(aucD) {
    var timer = aucD.getAttribute("data-timer");
    var divId = aucD.getAttribute("data-countD");
    var dueDate = new Date(timer).getTime();
    var countDown = setInterval(function () {
        var now = new Date().getTime();
        var duration = dueDate - now;
        var days = Math.floor(duration / (1000 * 60 * 60 * 24));
        var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((duration % (1000 * 60)) / 1000);
        document.getElementById(divId).innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
        if (duration < 0) {
            clearInterval(countDown);
            document.getElementById(divId).innerHTML = "EXPIRED"
        }
    })
}

function goBackToItems(){
    window.location.assign("/userItems");
}

function showMail(from,message,mID){
    $('#deleteMail').data('aID',mID); //setter
    var fromText = document.getElementById("fromText");
    var messageText = document.getElementById("messageText");    
    fromText.innerHTML = from;
    messageText.innerHTML = message;
}