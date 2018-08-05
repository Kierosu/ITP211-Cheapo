//this function can remove a array element.
Array.remove = function (array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

//this variable represents the total number of popups can be displayed according to the viewport width
var total_popups = 0;

//arrays of popups ids
var popups = [];

//this is used to close a popup
function close_popup(id) {
    for (var iii = 0; iii < popups.length; iii++) {
        if (id == popups[iii]) {
            Array.remove(popups, iii);

            document.getElementById(id).style.display = "none";

            calculate_popups();

            return;
        }
    }
}

//displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
function display_popups() {
    var right = 220;

    var iii = 0;
    for (iii; iii < total_popups; iii++) {
        if (popups[iii] != undefined) {
            var element = document.getElementById(popups[iii]);
            element.style.right = right + "px";
            right = right + 320;
            element.style.display = "block";
        }
    }

    for (var jjj = iii; jjj < popups.length; jjj++) {
        var element = document.getElementById(popups[jjj]);
        element.style.display = "none";
    }
}

//creates markup for a new popup. Adds the id to popups array.
function register_popup(id, name) {

    for (var iii = 0; iii < popups.length; iii++) {
        //already registered. Bring it to front.
        if (id == popups[iii]) {
            Array.remove(popups, iii);

            popups.unshift(id);

            calculate_popups();


            return;
        }
    }

    var element = '<div class="popup-box chat-popup" id="' + id + '">';

    element = element + '<div class="popup-head">';
    element = element + '<div class="popup-head-left">  ' + name + ' </div><i id= "blocker" class="fa fa-times hide-chat-box" aria-hidden="true" onclick="Hide();alert(\' You have blocked ' + id + '\');"></i>';
    element = element + '<div class="popup-head-right"><a href="javascript:close_popup(\'' + id + '\');">&#10005;</a></div>';
    element = element + '<div class="chat-content"><div class="col-md-12 chats border"><ul class="p-0">';
    element = element + '<div class="col-md-12 message-box border pl-2 pr-2 border-top-0">';
    element = element + '<section id="chatroom"> <section id="feedback"></section> </section>';
    element = element + '<input id= "message" class= "vertical-align" type= "text" required/>';
    element = element + '<button id= "send_message" class= "vertical-align" type= "submit">Send</button>';
    element = element + '<div class="tools"><i class="fa fa-picture-o" aria-hidden="true"></i><i class="fa fa-meh-o" aria-hidden="true"></i><i class="fa fa-folder" aria-hidden="true"></i><i class="fa fa-thumbs-o-up m-0" aria-hidden="true"></i>';
    element = element + '</div></div>';
    element = element + '<div style="clear: both"></div></div><div class="popup-messages"></div></div>';


    //onclick="alert(\''+ id + '\');"
    document.getElementsByTagName("body")[0].innerHTML = document.getElementsByTagName("body")[0].innerHTML + element;

    popups.unshift(id);

    calculate_popups();

}

//calculate the total number of popups suitable and then populate the total_popups variable.
function calculate_popups() {
    var width = window.innerWidth;
    if (width < 540) {
        total_popups = 0;
    }
    else {
        width = width - 200;
        //320 is width of a single popup box
        total_popups = parseInt(width / 320);
    }
    display_popups();
}

//recalculate when window is loaded and also when window is resized.
window.addEventListener("resize", calculate_popups);
window.addEventListener("load", calculate_popups);



function GetElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : {};
}


