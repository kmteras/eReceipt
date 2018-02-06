'use strict';
const express = require('express');
const db = require('./database.js');

const tag = new (require('./api/tag.js'))(db);
const receipt = new (require('./api/receipt.js'))(db);

const app = express();

app.use(express.static('static'));
app.get('/api/receipt/', (req, res) => receipt.get(req, res));
app.post('/api/receipt/', (req, res) => receipt.post(req, res));

app.get('/api/tag/', (req, res) => tag.get(req, res));
app.post('/api/tag/', (req, res) => tag.post(req, res));

app.listen(3000, () => console.log('Server running on port 3000'));