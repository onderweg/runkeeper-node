/*
	Based originally off runkeeper-js. Github: https://github.com/mko/runkeeper-js
*/

var open = require('open');
var http = require('http');
var Q = require('q');
var Url = require('url');
var request = require('request');
var fs = require('fs');

exports.types = {
	'Activity': 'application/vnd.com.runkeeper.FitnessActivity+json',
	'ActivityFeed': 'application/vnd.com.runkeeper.FitnessActivityFeed+json'
}

/**
 * Tries to retrieve access token
 */
exports.auth = function(options, token_file) {
	var deferred = Q.defer();

	// Try to read access token from file
	var access_token;
	try {
		access_token = fs.readFileSync(token_file, 'utf-8');
	} catch (err) {

	}

	if (access_token) {
		deferred.resolve( JSON.parse(access_token) );		
		return deferred.promise;
	}

	module.exports.get_authorization_code(options).then(function(code) {		
		return module.exports.getToken(options, code);
	}).then(function(access_token) {

		// Remeber access token
		fs.writeFile(token_file, JSON.stringify(access_token), function(err){
			if (err) throw err;		 
		});

		deferred.resolve(access_token);

	}, function(err) {
		 deferred.reject(err)
	});
	return deferred.promise;
}

// Step 1 oauth flow:
// direct the user to the Health Graph API authorization endpoint, and receive authorization token
// http://developer.runkeeper.com/healthgraph/registration-authorization
exports.get_authorization_code = function(options) {
	var deferred = Q.defer();

	var request_params = {
		client_id: options.client_id,
		response_type: 'code',
		redirect_uri: options.redirect_uri
	};
	var paramlist  = [];
	for (pk in request_params) {
		paramlist.push(pk + "=" + request_params[pk]);
	};
	var param_string = paramlist.join("&");	

	// Setup a local server, to receive callback with autorization code
	var server = http.createServer(function (request, response) {				
		var query = Url.parse(request.url,true).query;

		// Note: this callback can be called twice
		// One of those is browser requests is for favicon
		if (!('code' in query)) {
			// Ignore this request
			return;
		}

		response.writeHead(200, {
		  	"Content-Type": "text/plain"
		});
		response.end("Authorization code received.\n");		
		deferred.resolve(query.code);		
		
	}).on('error', deferred.reject );

	// Listen on port 8000, IP defaults to 127.0.0.1
	server.listen(8000);

	var url = options.auth_url + '?' + param_string;
	open(url);	

	return deferred.promise;
}

// Step 2 in oauth flow: get access token
exports.getToken = function(client, authorization_code) {
	var deferred = Q.defer();

    var request_params = {
		grant_type: "authorization_code",
		code: authorization_code,
		client_id: client.client_id,
		client_secret: client.client_secret,
		redirect_uri: client.redirect_uri
    };
    
    var paramlist  = [];
    for (pk in request_params) {
		paramlist.push(pk + "=" + request_params[pk]);
    };
    var body_string = paramlist.join("&");

    var request_details = {  
		method: "POST",
		headers: {'content-type' : 'application/x-www-form-urlencoded'},
		uri: client.access_token_url,
		body: body_string
    };

    request(request_details, function(err, response, body) {

	    if(err) { 
	    	deferred.reject(err);
	    	return false; 
	   	}

	    var access_token = JSON.parse(body)['access_token']

		deferred.resolve(access_token);
	});

	return deferred.promise;
}

var HealthGraph = exports.HealthGraph = function(options, access_token) {
    this.access_token = access_token;
    this.api_domain = "api.runkeeper.com";
};

HealthGraph.prototype.apiCall = function(method, media_type, endpoint, data) {
	var deferred = Q.defer();

	var request_details = {
		method: method || 'GET',
		headers: {
			'Accept': media_type,
			'Authorization' : 'Bearer ' + this.access_token
		},
		uri: "https://" + this.api_domain + endpoint
	};
	if (method == 'POST' || method == 'PUT') {		
		request_details.headers['Content-Type'] = media_type;
		request_details.body = JSON.stringify(data);
	}

	request(request_details, function(error, response, body) { 
		if (response.statusCode >= 400 && response.statusCode < 500) {
			// In the event of an error, a message is returned in the response body
			// Note: current HealthGraph api returns HTML messages. 
			// Machine-readable messages will be added for other response codes in the future
			deferred.reject('API responed with an error message: ' + body);
			return;
		}
		try {
			parsed = JSON.parse(body);
			deferred.resolve(parsed);
		} catch(e) {
			error = new Error('Body reply is not a valid JSON string.');
			error.runkeeperBody = body;
			deferred.reject(error);
		}
	});

	return deferred.promise;
};

module.exports = exports;