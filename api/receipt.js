'use strict';

module.exports = class Receipt {
    static get validator(){
        return {
            $and: [
                { client_id: { $type: 'string' }},
                { store: { $type: 'string' }},
                { total: { $type: 'double' }},
                { date: { $type: 'date' }},
                {
                    $and: [
                        { items: { $exists: true } },
                        { 'items.name': { $type: 'string' }},
                        { 'items.amount': { $type: 'int' }},
                        { 'items.price_per': { $type: 'double' }}
                    ]
                }
            ]
        }
    };

    constructor(db) {
        this.db = db;
        const that = this;
        this.db(function(error, database) {
            if(error) {
                throw error;
            }
            else {
                that.database = database;
                that.setup(database);
            }
        });
    }

    setup(db) {
        db.createCollection('receipts', {validator: Receipt.validator}, function(err, result) {
            if(err) {
                throw err;
            }
        });
    }

    get(req, res) {
        let request_data = {};

        console.log(req.query);

        if(req.query.client_id === undefined) {
            res.json({error: 'Client_id parameter missing in request'});
            return;
        }

        if(req.query.start_time !== undefined) {
            request_data.date = {};
            request_data.date.$gte = new Date(req.query.start_time);
        }

        if(req.query.end_time !== undefined) {
            if (req.query.start_time === undefined) {
                request_data.date = {};
            }
            request_data.date.$lte = new Date(req.query.end_time);
        }

        if(req.query.client_id === "-1") {
            this.database.collection('receipts').find(request_data).toArray(function(err, docs) {
                res.json(docs);
            });
        }
        else {
            request_data.client_id = req.query.client_id;

            this.database.collection('receipts').find(request_data).toArray(function(err, docs) {
                res.json(docs);
            });
        }
    }

    post(req, res) {
        req.body.date = new Date(req.body.date); //body-parser parses date object to string
        this.database.collection('receipts').insertOne(req.body, function(err, result) {
            if(err === null) {
                res.json({error: null});
            }
            else {
                res.json({error: err});
            }
        });
    }
};