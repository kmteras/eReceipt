const express = require('express');
const db = require('./database.js');

const app = express();

app.use(express.static('static'));
app.get('/api/', (req, res) => api(req, res));

function api(req, res) {
    db(function(error, database) {
        if(error) {
            res.sendStatus(500);
        }
        else {
            database.collection('test').find().toArray(function(err, docs) {
                res.json(docs);
            });
        }
    });
}

app.listen(3000, () => console.log('Server running on port 3000'));