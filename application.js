const http = require('http');
const mongoClient = require('mongodb').MongoClient;

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'ereceipt';

mongoClient.connect(dbUrl, function(err, client) {
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
});

var app = http.createServer(function(req, res) {
    if(req.url.startsWith("/api")) {
        //API Call
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({api: "0.1"}));
    } else {
        //Front-end call; serve static file
        //TODO: File serving
    }

});

app.listen(3000);