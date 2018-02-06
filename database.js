"use strict";
const mongodb = require('mongodb').MongoClient;

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'ereceipt';

let db;
let error;
let waiting = [];

mongodb.connect(dbUrl, function(err, database) {
    console.log("Connected successfully to database server");

    error = err;
    db = database.db(dbName);

    waiting.forEach(function(callback) {
        callback(error, db)
    })
});

module.exports = function(callback) {
    if(db || error) {
        callback(error, db);
    }
    else {
        waiting.push(callback);
    }
};