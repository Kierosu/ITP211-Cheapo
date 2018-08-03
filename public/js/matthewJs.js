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

function goBackToItems() {
    window.location.assign("/userItems");
}

function showMail(from, message, mID) {
    $('#deleteMail').data('aID', mID); //setter
    var fromText = document.getElementById("fromText");
    var messageText = document.getElementById("messageText");
    fromText.innerHTML = from;
    messageText.innerHTML = message;
}

function followingU() {
    var follower = document.getElementById("followerUsers");
    var following = document.getElementById("followingUsers");
    var btnFollowing = document.getElementById("btnFollowing");
    var btnFollower = document.getElementById("btnFollower");
    btnFollowing.style.backgroundColor = "#f69679";
    btnFollower.style.backgroundColor = "#5bc0de";
    following.style.display = "block";
    follower.style.display = "none";
}

function followerU() {
    var follower = document.getElementById("followerUsers");
    var following = document.getElementById("followingUsers");
    var btnFollowing = document.getElementById("btnFollowing");
    var btnFollower = document.getElementById("btnFollower");
    btnFollowing.style.backgroundColor = "#5bc0de";
    btnFollower.style.backgroundColor = "#f69679";
    follower.style.display = "block";
    following.style.display = "none";
}

$(".sList").hover(function () {
    $(this).css("background-color", "rgb(229, 233, 229)");
}, function () {
    $(this).css("background-color", "transparent");
});