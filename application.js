'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database.js');
const fs = require('fs');

const tag = new (require('./api/tag.js'))(db);
const search = new (require('./api/search.js'))(db);
const receipt = new (require('./api/receipt.js'))(db);

//const privateKey = fs.readFileSync('ssl/server.key', 'utf8');
//const publicKey = fs.readFileSync('ssl/server.crt', 'utf8');

const app = express();

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/api/receipt/', (req, res) => receipt.get(req, res));
app.post('/api/receipt/', (req, res) => receipt.post(req, res));

app.get('/api/tag/', (req, res) => tag.get(req, res));
app.post('/api/tag/', (req, res) => tag.post(req, res));

app.get('/api/search/', (req, res) => search.get(req, res));

app.listen(3000, () => console.log('Server running on port 3000'));