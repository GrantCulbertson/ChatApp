// Rest based chat client
// Jim Skon 2022
// Kenyon College

var baseUrl = 'http://18.116.8.156:5005';
var state="off";
var myname="";
var inthandle;
var inthandle2;
var inthandle3;
var inthandle4;


/* Start with text input and status hidden */
document.getElementById('chatinput').style.display = 'none';
document.getElementById('status').style.display = 'none';
document.getElementById('leave').style.display = 'none';
// Action if they push the join button
document.getElementById('login-btn').addEventListener("click", (e) => {
	join();
})

/* Set up buttons */
document.getElementById('leave-btn').addEventListener("click", leaveSession);
document.getElementById('send-btn').addEventListener("click", sendText);
// Watch for enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
    if (e.code == "Enter") {
	sendText();
    }   
});


// Call function on page exit
window.onbeforeunload = leaveSession;


function completeJoin(results) {
	var status = results['status'];
	console.log(status)
	if (status != "success") {
		alert("Account Not Found");
		leaveSession();
		return;
	}
	var user = results['user'];
	console.log("Join:"+user);
	//https://stackoverflow.com/questions/3180710/javascript-change-p-content-depending-on-select-option
	startSession(user);
}

function join() {
	myname = document.getElementById('yourname').value;
	mypass = document.getElementById('yourpass').value;
	fetch(baseUrl+'/chat/join/'+myname+'/'+mypass, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeJoin(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })
}

function completeSend(results) {
	var status = results['status'];
	document.getElementById('message').value = '';
	if (status == "success") {
		console.log("Send succeeded")
	} else {
		alert("Error sending message!");
	}
}

//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
	document.getElementById('message').value = '';
    console.log("Send: "+myname+":"+message);
	fetch(baseUrl+'/chat/send/'+myname+'/'+message, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeSend(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })    
	
}



function completeFetch(result) {
	messages = result["messages"];
	messages.forEach(function (m,i) {
		name = m['user'];
		message = m['message'];
		document.getElementById('chatBox').innerHTML +=
	    	"<font color='red'>" + name + ": </font>" + message + "<br />";
	});
}

/* Check for new messaged */
function fetchMessage() {
	fetch(baseUrl+'/chat/fetch/'+myname, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeFetch(data))
    .catch(error => {
        {console.log("Server appears to be down");}
    })
}
/* Functions to set up visibility of sections of the display */
var nameHold;
function startSession(name){
    state="on";
    
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'none';
    document.getElementById('user').innerHTML = "User: " + name;
	nameHold = name;
	console.log(nameHold);
    document.getElementById('chatinput').style.display = 'block';
    document.getElementById('status').style.display = 'block';
    document.getElementById('leave').style.display = 'block';
    /* Check for messages every 500 ms */
    inthandle=setInterval(fetchMessage,500);
	inthandle2=setInterval(getUsers,500);
	inthandle3=setInterval(checkTyping,200);
	inthandle3=setInterval(updateShowTyping,5000);
}

function leaveSession(){
    state="off";
    removeUser(nameHold);
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'block';
    document.getElementById('user').innerHTML = "";
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('status').style.display = 'none';
    document.getElementById('leave').style.display = 'none';
	clearInterval(inthandle);
	clearInterval(inthandle2);
	clearInterval(inthandle3);
	clearInterval(inthandle4);
}

//FUNCTIONS THAT I HAVE ADDED BELOW-------------------------------------------------------------------



document.getElementById('invite-friend').addEventListener("click", sendEmail);
//Invite someone via email
var smtpTransport = nodemailer.createTransport("SMTP",{
host: "mail.smtp2go.com",
port: 2525, // 8025, 587 and 25 can also be used.
auth: {
user: "culbertson2@kenyon.edu",
pass: "CB9QtidSZXjjuSb"
}
});

smtpTransport.sendMail({
from: "kenyonsoftwaredev@gmail.com",
to: "culbertsongrant@gmail.com",
subject: "Your Subject",
text: "It is a test message"
}, function(error, response){
if(error){
console.log(error);
}else{
console.log("Message sent: " + response.message);
}
});
	
	

//Functions to dynamically update user list
function getUsers() {
	fetch(baseUrl+'/chat/userlist', {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>updateUsers(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })
}
function updateUsers(result) {
	userList = result["userList"];
	document.getElementById('userlist').innerHTML = userList;
}

//functions to register a user , /chat/register/username/email/password
document.getElementById('submitButton').addEventListener("click", registerUser);
function registerUser(){
	console.log("registerUser() running");
	username = document.getElementById('user-name').value;
	email = document.getElementById('user-email').value;
	pass = document.getElementById('user-password').value;
	fetch(baseUrl+'/chat/register/'+username +'/'+email+'/'+pass, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeRegisterUser(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })
}

function completeRegisterUser(results){
	var status = results['status'];
	console.log(status)
	if (status != "success") {
		alert("Username or Email already exists! Password must be more than 6 characters");
		leaveSession();
		return;
	}
	var user = results['user'];
	alert("Registration Successful");
	console.log("Registered:"+user);
	username = document.getElementById('user-name').value = '';
	email = document.getElementById('user-email').value = '';
	pass = document.getElementById('user-password').value = '';
}

//Function to remove a user after they leave the site.
function removeUser(){
		fetch(baseUrl+'/chat/userlist/remove/'+nameHold, {
        method: 'get'
    })
}	

//Functions to update the server as to whether someone is typing
function checkTyping(){
	var message = document.getElementById('message').value;
	//console.log(message);
		if(message != ""){
		updateTyping();
	} else{
		removeTyping();
	}
}

function updateTyping(){
		fetch(baseUrl+'/chat/typing/update/'+nameHold, {
        method: 'get'
    })
	//console.log("User is Typing");
}

function removeTyping(){
		fetch(baseUrl+'/chat/typing/remove/'+nameHold, {
        method: 'get'
		})
	//console.log("User is not typing");
}


function updateShowTyping(){
		fetch(baseUrl+'/chat/typingmessage/'+nameHold, {
        method: 'get'
    })
}

