// modules
var express = require('express');
var app = express();
var mongoose = require('mongoose');

// configuration

// config files

var db = require('./config/db');

var port = process.env.PORT || 8080; // set to env. var if it exists, otherwise 8080
// mongoose.connect(db.url); // connect to mongoDB database

app.configure(function() {
    app.use(express.static(__dirname + '/public')); // set the static files location
    app.use(express.logger('dev'));
    app.use(express.bodyParser()); // have the ability to pull information from html in POST
    app.use(express.methodOverride()); // have the ability to simulate DELETE and PUT
});

// routes

require('./app/routes')(app); // note that require(...) returns a function itself, which is immediately called with the argument app.

app.listen(port);
console.log('Exciting things are happening! Check it out at port ' + port);
exports = module.exports = app;
