'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database.js');
const fs = require('fs');
const http = require('http');
const https = require('https');
const compression = require('compression');

const helmet = require('helmet');
const cors = require('cors');


const sni = require('sni-reader');
const net = require('net');

const tag = new (require('./api/tag.js'))(db);
const search = new (require('./api/search.js'))(db);
const receipt = new (require('./api/receipt.js'))(db);
const receipt_tag = new (require('./api/receipt_tag.js'))(db);


const privateKey = fs.readFileSync('ssl/server.key', 'utf8');
const publicKey = fs.readFileSync('ssl/server.crt', 'utf8');

const httpsNoAuth = {
    key: privateKey,
    cert: publicKey
};
const httpsAuth = {
    key: privateKey,
    cert: publicKey
//    ,requestCert: true,
//    rejectUnauthorized: true
};

const app = express();
const app2 = express();


app.use(function(req, res, next) {
    console.log(req.url);
    if(req.url.startsWith("/receipts")){
        req.url = '/';
    }
    if(req.url.startsWith("/statistics")){
        req.url = '/';
    }
    next();
});

//app.use(compression());
//app2.use(compression());

app.use(helmet());
app2.use(helmet());
app.use(express.static('eReceipt-front/dist/'));
app2.use(express.static('eReceipt-front/simple_html/landing_page'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const longpoll =  require("express-longpoll")(app);

app.put('/api/receipt/', (req, res) => receipt.put(req, res));
app.get('/api/receipt/', (req, res) => receipt.get(req, res));
app.post('/api/receipt/', (req, res) => receipt.post(req, res));

app.get('/api/tag/', (req, res) => tag.get(req, res));
app.post('/api/tag/', (req, res) => tag.post(req, res));

app.get('/api/search/', (req, res) => search.get(req, res));

app.post('/api/receipt/tag', (req, res) => receipt_tag.post(req, res));
app.delete('/api/receipt/tag', (req, res) => receipt_tag.delete(req, res));

app.get('/api/whoami', (req, res) => {
    if(req.socket.getPeerCertificate().subject !== undefined) {
        console.log(req.socket.getPeerCertificate().subject);
        console.log(req.socket.getPeerCertificate().subject.serialNumber.substr(7, 4) + '_' + req.socket.getPeerCertificate().subject.GN.replace(' ', '_') + "_" + req.socket.getPeerCertificate().subject.SN);
        res.send(req.socket.getPeerCertificate().subject.GN + " " + req.socket.getPeerCertificate().subject.SN);
    } else {
        res.send("DEMO_CLIENT");
    }
});

app.listen(3004, () => console.log("Http testing server running on port 3004"));

const httpsServer = https.createServer(httpsNoAuth, app2);
const httpsAuthServer = https.createServer(httpsAuth, app);

httpsServer.listen(3001, () => console.log('Noauth Server running on port 3001'));
httpsAuthServer.listen(3002, () => console.log('Auth server running on port 3002'));


//TODO: Redirect to HTTPS

const frontServer = net.createServer( (serversocket) => {
    sni(serversocket, (err, sniName) => {
        console.log(sniName);
        if(err) {
            console.log("SNI error");
            serversocket.end();
        } else if(sniName) {
            let clientsocket = undefined;
            if(sniName.includes("id")) {
                clientsocket = net.connect({port: 3002, type: 'tcp', host: "localhost"});
            } else {
                clientsocket = net.connect({port: 3001, type: 'tcp', host: "localhost"});
            }

            clientsocket.on("connect" , () => {
                serversocket.pipe(clientsocket).pipe(serversocket);
            });
            clientsocket.on('error', function(err) {
                serversocket.end();
            });
            serversocket.on('error', function(err) {
                clientsocket.end();
            })
        } else {
            console.log("No SNI!");
            serversocket.end();
        }
    });
});

frontServer.listen(443, () => console.log("Front server running on port 443"));


http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);
