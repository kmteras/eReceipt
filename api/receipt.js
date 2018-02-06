'use strict';

module.exports = class Receipt {
    static get validator(){
        return {
            type: 'object',
            properties: {
                store: {
                    type: 'string'
                },
                total: {
                    type: 'number'
                },
                date: {
                    type: 'string',
                    format: 'date-time'
                }
            },
            required: [
                'store',
                'total',
                'date'
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
        console.log(req.query);
        this.database.collection('receipts').find().toArray(function(err, docs) {
            res.json(docs);
        });
    }

    post(req, res) {
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