'use strict';
// Load the SDK for JavaScript
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});

exports.handler = (event, context, callback) => {

    var time = new Date();
    var username = "username";
    var password = "password";
    
    if (event.body !== null && event.body !== undefined) {
        var body = JSON.parse(event.body);        
        if (body.username) {
			username = body.username;    
		}else{
			// error scenario // validation error with code
		}
	            
		if (body.password) {
			password = body.password;    
		}else{
			// error scenario // validation error with code
		}
    }
    
    var responseBody = {
        account: "created",
        time: time
    };
    
    var response = {
        statusCode: 200,
        headers: {
            "x-custom-header" : "my custom header value"
        },
        body: JSON.stringify(responseBody)
    };
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
	var params = {
		MessageAttributes: {
			"username": {
				  DataType: "String",
				  StringValue: username
			},
			"password": {
				  DataType: "String",
				  StringValue: password
			}
		},
		MessageBody: username +" : requested for registeration",
		QueueUrl: "https://sqs.us-east-2.amazonaws.com/952884883545/registerUserTestQueue"
	};
        
	sqs.sendMessage(params, function(err, data) {
	  if (err) {
		console.log("Error", err);
	  } else {
		console.log("Success", data.MessageId);
	  }
	});
	console.log("response: " + JSON.stringify(response));
	
    callback(null, response);
};