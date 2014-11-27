runkeeper-node
==============

Experimental Node.js library for RunKeeper Health Graph API, based originally off [runkeeper-js](https://github.com/mko/runkeeper-js).

This is an early alpha version, with no support or guarantees. Needs a bit of love and some tests. Feel free to fork and improve.

Main changes/improvements compared to *runkeeper-js*:

- Use of promises (via [Q](https://github.com/kriskowal/q)), instead of callbacks.
- Method `get_authorization_code` (step 1 of oAuth flow) added.
- Support for updates via POST/PUT requests. For example, to change activity notes.
- Utility method to convert activity path to GeoJSON.

##Installation

This module is not (yet) availble on NPM.

To install: clone this repository and install from local directory:

	$ npm install <path to cloned repository>
	
##Module structure

- Methods used to authenticate, and utility methods, like `toGeoJSON()` are module methods.
- All methods that rely on authorized API access, are part of the module's `HealthGraph` object. You have to supply a valid access token to this object: `new hg = run.HealthGraph(options, access_token)`

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

// This file is used to cache the retrieved access token.
// Alternatively, you can add an access token manually to this file.
var access_token_file = __dirname + "/access_token.json";

run.auth(options, access_token_file).then(function(access_token) {	
	// Create a client, and set the client's Access Token. 
	// Any future API Calls will be performed using the authorized user's access token. 
	var client = new run.HealthGraph(options, access_token);
	
	client.apiCall('GET', run.types.User, '/user').then(function(user) {
		
		console.log(user);

		// Retrieve list of all activities
		return client.apiCall('GET', run.types.ActivityFeed, user.fitness_activities );				

	}).then(function(activities) {

		console.log(activities);

	}, function(err) {

		console.log(err);
		process.exit();			

	});
	
});	
```		
##Health Graph feature requests

Health Graph feature reqeusts/ideas, to make this client more useful:

- Support for PIN authentication in OAuh flow (like [Twitter](https://dev.twitter.com/docs/auth/pin-based-authorization)), to make it easer to authenticate from console apps. Or, as many other APIs support, make it possible to create access tokens form the API applications admin panel.
- Error responses in JSON format, instead of HTML.
- Support for custom data object (key/values) in activity. Can be used for example to store weather data (temperature, humidity) for an activity by an external application.

## Contributors

Based on: 

- [node-runkeeper](https://github.com/marksoper/node-runkeeper) originally authored by [Mark Soper](https://github.com/marksoper/)
- which was then forked by [Christine Yen](https://github.com/christineyen)
- and then resurrected by [Michael Owens](https://github.com/mowens) as RunKeeper.js (`runkeeper-js` on NPM)
- which inspired [me](https://github.com/onderweg/)

## License

This package is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

