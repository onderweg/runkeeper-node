runkeeper-node
==============

Experimental Node.js library for RunKeeper Health Graph API, based originally off [runkeeper-js](https://github.com/mko/runkeeper-js).

This is an early alpha version, with no support or guarantees. Feel free to fork and improve.

Main changes/improvements compared to *runkeeper-js*:

- Use of promises instead of callbacks
- Method `get_authorization_code` added in authorization flow
- Support for updates via POST/PUT requests

##Installation

This module is not (yet) availble on NPM.

To install: clone this repository and install from local directory:

	$ npm install <path to cloned repository>

##Example

Usage example:

```javascript

var run = require('runkeeper-node');

// Set up your client's options
// See: https://github.com/mko/runkeeper-js
var options = exports.options = {

    // Client ID (Required): 
    // This value is the OAuth 2.0 client ID for your application.  
    client_id : '<Your API Client ID>',

    // Client Secret (Required):  
    // This value is the OAuth 2.0 shared secret for your application.   
    client_secret : '<Your Client secret>',

    // Authorization URL (Optional, default will work for most apps):
    // This is the URL to which your application should redirect the user in order to authorize access to his or her RunKeeper account.   
    auth_url : "https://runkeeper.com/apps/authorize",

    // Access Token URL (Optional, default will work for most apps):
    // This is the URL at which your application can convert an authorization code to an access token. 
    access_token_url : "https://runkeeper.com/apps/token",

    // Redirect URI (Optional but defaults to null, which means your app won't be able to use the getNewToken method):
    // This is the URL that RK sends user to after successful auth  
    // URI naming based on Runkeeper convention 
    redirect_uri : 'http://localhost:8000',

    // Access Token (Optional, defaults to null):
    // When doing Client API Calls on behalf of a specific user (and not getting a new Access Token for the first time), set the user's Access Token here.
    access_token : null,

    // API Domain (Optional, default will work for most apps):
    // This is the FQDN (Fully qualified domain name) that is used in making API calls
    api_domain : "api.runkeeper.com"
};


var access_token_file = __dirname + "/access_token.json";

run.auth(options, access_token_file).then(function(access_token, err) {	
	if (err) {
		console.log(err);
		process.exit();	
	}
	// Create a Client
	var client = new run.HealthGraph(options);

	// Set the client's Access Token. Any future API Calls will be performed using the authorized user's access token. 
	client.access_token = access_token;
	
	client.apiCall('GET', run.types.User, '/user').then(function(user) {
		
		return user;

	}).then(function(user) {

		console.log(user);

		// Retrieve list of all activities
		return client.apiCall('GET', run.types.ActivityFeed, '/fitnessActivities');		

	}).then(function(activities) {

		console.log(activities);
	});
	
})	
```		

## Contributors

Based on: 

- [node-runkeeper](https://github.com/marksoper/node-runkeeper) originally authored by [Mark Soper](https://github.com/marksoper/)
- which was then forked by [Christine Yen](https://github.com/christineyen)
- and then resurrected by [Michael Owens](https://github.com/mowens) as RunKeeper.js (`runkeeper-js` on NPM)
- and then forked by [Michael Owens](https://github.com/mowens)
- which inspired [me](https://github.com/onderweg/)
