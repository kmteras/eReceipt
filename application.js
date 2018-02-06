'use strict';
const express = require('express');
const db = require('./database.js');

const receipt = new (require('./api/receipt.js'))(db);

const app = express();

app.use(express.static('static'));
app.get('/api/', (req, res) => receipt.test(req, res));

app.listen(3000, () => console.log('Server running on port 3000'));