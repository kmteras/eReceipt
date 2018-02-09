'use strict';

const ObjectID = require('mongodb').ObjectID;

module.exports = class Receipt {
    static get validator(){
        return {
            $and: [
                { client_id: { $type: 'string' }},
                { store: { $type: 'string' }},
                { total: { $type: 'double' }},
                { date: { $type: 'date' }},
                //{ business: { $type: 'bool' }},
                {
                    $and: [
                        { items: { $exists: true }},
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
            db.collection('receipts').createIndex({ store: 'text' }, { unique: false }, function(err, result) {
                if(err) {
                    throw err;
                }
            });
        });
    }

    put(req, res) {
        if(req.body.receipt_id === undefined) {
            res.json({ error: 'Receipt id value need to be defined' });
        }

        if(req.body.business === undefined) {
            res.json({ error: 'Busniness value needs to be defined' });
        }

        this.database.collection('receipts').updateOne({ _id: new ObjectID(req.body.receipt_id) },
            {
                $set: {
                    business: req.body.business
                }
            }, function (err, result) {
                res.json({error: err, result: result});
            });
    }

    get(req, res) {
        let request_data = {};

        //TODO: Replace with auth
        if(req.query.client_id === undefined) {
            res.json({ error: 'Client_id parameter missing in request' });
            return;
        }

        if(req.query.tags !== undefined) {
            request_data['tags.name'] = { $in: JSON.parse(req.query.tags) };
        }

        if(req.query.store_search !== undefined) {
            request_data.store = { $regex: new RegExp(`.*${req.query.store_search}.*`),
                    $options: 'i'};
        }

        if(req.query.item_search !== undefined) {
            request_data['items.name'] = { $regex: new RegExp(`.*${req.query.item_search}.*`) };
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

        if(req.query.business === undefined || req.query.business === false) {
            request_data.$or = [ { business: { $eq: false }}, { business: { $exists: false }}];
        }
        else {
            request_data.business = { $eq: true };
        }

        if(req.query.client_id === "-1") {
            this.database.collection('receipts').find(request_data).toArray(function(err, docs) {
                if(err) {
                    res.json({error: err});
                }
                else {
                    res.json(docs);
                }
            });
        }
        else {
            request_data.client_id = req.query.client_id;

            this.database.collection('receipts').find(request_data).toArray(function(err, docs) {
                if(err) {
                    res.json({error: err});
                }
                else {
                    res.json(docs);
                }
            });
        }
    }

    post(req, res) {
        req.body.date = new Date(req.body.date); //body-parser parses date object to string
        req.body.tags = [];
        req.business = false;
        this.database.collection('receipts').insertOne(req.body, function(err, result) {
            res.json({error: null});
        });
    }
};
