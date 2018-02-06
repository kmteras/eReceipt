const http = require('http');
const express = require('express');
const mongoClient = require('mongodb').MongoClient;

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'ereceipt';

mongoClient.connect(dbUrl, function(err, client) {
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
});

var app = express();

app.get('/', (req, res) => receipts(req, res));
app.get('/api/', (req, res) => api(req, res));

function receipts(req, res) {
    res.send("Test");
}

function api(req, res) {
    res.json({x: 1})
}

app.listen(3000, () => console.log('Server running on port 3000'));