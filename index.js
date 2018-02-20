var async = require("async");
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region: 'us-east-2'});
var lambda = new AWS.Lambda({region: 'us-east-2'});

function receiveMessages(callback) {
  var params = {
    QueueUrl: "https://sqs.us-east-2.amazonaws.com/952884883545/registerUserTestQueue",
    MaxNumberOfMessages: 5
  };
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      callback(err);
    } else {
      callback(null, data.Messages);
    }
  });
}

function invokeWorkerLambda(task, callback) {
  var params = {
    FunctionName: 'RegisterUserWorkerFunction',
    InvocationType: 'Event',
    Payload: JSON.stringify(task)
  };
  lambda.invoke(params, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function handleSQSMessages(context, callback) {
  receiveMessages(function(err, messages) {
    if (messages && messages.length > 0) {
      var invocations = [];
      messages.forEach(function(message) {
        invocations.push(function(callback) {
          invokeWorkerLambda(message, callback);
        });
      });
      async.parallel(invocations, function(err) {
        if (err) {
          console.error(err, err.stack);
          callback(err);
        } else {
          if (context.getRemainingTimeInMillis() > 20000) {
            handleSQSMessages(context, callback); 
          } else {
            callback(null, 'PAUSE');
          }         
        }
      });
    } else {
      callback(null, 'DONE');
    }
  });
}

exports.handler = function(event, context, callback) {
  handleSQSMessages(context, callback);
};