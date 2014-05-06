// modules
var express = require('express');
var app = express();
var port = process.env.PORT || 8080; // set to env. var if it exists, otherwise 8080

// TODO: UNCOMMENT FOR DEV MONGODB STUFF

//var mongoose = require('mongoose');
//var db = require('./config/db');
//var Schema = mongoose.Schema;
//var ObjectId = Schema.ObjectId;
//var Factory = require('./module.factory.js');
//// Database

//mongoose.connect(db.url); // connect to mongoDB database
//var db = mongoose.connection;

//db.on('error', function callback() {
    //console.log('Connection error.');
//});

//db.once('open', function callback() {
    //console.log('Mongo working!');
//});

var factory = null;
//var factory = new Factory(Schema, mongoose);
//factory.createSchemas();
//factory.insertGraphs(); // Insert some dummy data

app.configure(function() {
    app.use(express.static(__dirname + '/app')); // set the static files location
    app.use(express.logger('dev'));
    app.use(express.bodyParser()); // have the ability to pull information from html in POST
    app.use(express.methodOverride()); // have the ability to simulate DELETE and PUT
});

// routes
require('./server/routes')(app, factory); // note that require(...) returns a function itself, which is immediately called with the argument app.

app.listen(port);
console.log('Exciting things are happening! Check it out at port ' + port);
exports = module.exports = app;
