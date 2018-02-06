'use strict';

module.exports = class Receipt {
    static get validator(){
        return {
            $and: [
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
        this.database.collection('receipts').find().toArray(function(err, docs) {
            res.json(docs);
        });
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