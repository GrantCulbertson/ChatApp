//
//  namesAPI.cc - a microservice demo program
//
// James Skon
// Kenyon College, 2022
//

#include <iostream>
#include <fstream>
#include <map>
#include <algorithm>
#include "httplib.h"

using namespace httplib;
using namespace std;

const int port = 5005;

//CLASSES HERE-------------------------------------------------
class userClass {       // The class
  public:           // Access specifier
    string name;   // Attribute (Name)
    string pass;  // Attribute (Password)
    string email; // Attribute (Email)
	vector<string> messages; //Vector of all messages
};

class userData {       // The class
  public:           // Access specifier
	vector<string> usernames; //Vector of all users
};
//CLASSES ABOVE-------------------------------------------------


void addMessage(string username, string message, map<string,vector<string>> &messageMap) {
	/* iterate through users adding message to each */
	string jsonMessage = "{\"user\":\""+username+"\",\"message\":\""+message+"\"}";
	for (auto userMessagePair : messageMap) {
		username = userMessagePair.first;
		messageMap[username].push_back(jsonMessage);
	}
}

string getMessagesJSON(string username, map<string,vector<string>> &messageMap) {
	/* retrieve json list of messages for this user */
	bool first = true;
	string result = "{\"messages\":[";
	for (string message :  messageMap[username]) {
		if (not first) result += ",";
		result += message;
		first = false;
	}
	result += "]}";
	messageMap[username].clear();
	return result;
}

 //Under this will be code to add someone to a bank of users.


int main(void) {
  Server svr;
  int nextUser=0;
  map<string,vector<string>> messageMap;
  map<string,vector<string>> userMap;
  vector<string> userList;

	
  /* "/" just returnsAPI name */
  //This is the API home page
  svr.Get("/", [](const Request & /*req*/, Response &res) {
    res.set_header("Access-Control-Allow-Origin","*");
    res.set_content("Chat API", "text/plain");
  });

  //This is a test page
  svr.Get("/newpage", [](const Request & /*req*/, Response &res) {
    res.set_header("Access-Control-Allow-Origin","*");
    res.set_content("This is a New API part", "text/plain");
  });
  
  //REGISTRATION: This Section should handle someone registering, /chat/register/username/email/password
  svr.Get(R"(/chat/register/(.*)/(.*)/(.*))", [&](const Request& req, Response& res) {
	res.set_header("Access-Control-Allow-Origin","*");
    string username = req.matches[1];
	string email = req.matches[2];
	string password = req.matches[3];
    string result;
    vector<string> empty;
		//Initalize a user object
		userClass Bob;
    // Check if user with this name or email already exists, or if password is less than 6 characters.
    if (messageMap.count(username) or messageMap.count(email) or password.length() < 7){
    	result = "{\"status\":\"registrationfailure\"}";
    } else {
    	// Add user, email, and password to messages map
    	messageMap[username]=empty;
		messageMap[email]=empty;
		messageMap[password]=empty;
    	result = "{\"status\":\"success\",\"user\":\"" + username + "\",\"email\":\"" + email + "\",\"pass\":\"" + password + "\"}";
		//Add user, email, and password to userClass.
		Bob.name = username;
		Bob.pass = password;
		Bob.email = email;
		//Add new user to a vector
		userList.push_back(username);
		//Output some stuff
		cout << username << " registered" << endl;
		nextUser += 1;
		cout << "User Email: " << email << endl;

    }
    res.set_content(result, "text/json");
  });
  
  //This Section is the part of the API for logging in.
  svr.Get(R"(/chat/join/(.*)/(.*))", [&](const Request& req, Response& res) {
    res.set_header("Access-Control-Allow-Origin","*");
    string username = req.matches[1];
	string password = req.matches[2];
    string result;
    vector<string> empty;
    
    // Check if user with this name and password exists
    if (messageMap.count(username) and messageMap.count(password)) {
    	result = "{\"status\":\"success\",\"user\":\"" + username + "\"}";
		 cout << username << " joins" << endl;
		 cout << messageMap.size() << endl;
    } else {
    	result = "{\"status\":\"failure\"}";
    }
    res.set_content(result, "text/json");
  });

  //This is the part of the API that handles sending messages.
   svr.Get(R"(/chat/send/(.*)/(.*))", [&](const Request& req, Response& res) {
    res.set_header("Access-Control-Allow-Origin","*");
	string username = req.matches[1];
	string message = req.matches[2];
	string result; 
    if (!messageMap.count(username)) {
    	result = "{\"status\":\"baduser\"}";
	} else {
		addMessage(username,message,messageMap);
		result = "{\"status\":\"success\"}";
	}
    res.set_content(result, "text/json");
  });
  
  //This part of the code grabs messages that are sent
   svr.Get(R"(/chat/fetch/(.*))", [&](const Request& req, Response& res) {
    string username = req.matches[1];
    res.set_header("Access-Control-Allow-Origin","*");
    string resultJSON = getMessagesJSON(username,messageMap);
    res.set_content(resultJSON, "text/json");
  });
  
    //This part of the code grabs a list of users
   svr.Get(R"(/chat/fetch/users)", [&](const Request& req, Response& res) {
    res.set_header("Access-Control-Allow-Origin","*");
    res.set_content(userList, "text/plain");
  });
  
  //What comes out in the Linux Console:
  cout << "Server listening on port " << port << endl;
  cout << "Chat Time" << endl;
  svr.listen("0.0.0.0", port);

}


