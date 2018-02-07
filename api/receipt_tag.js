'use strict';

module.exports = class ReceiptTag {
    constructor(db) {
        this.db = db;
        const that = this;
        this.db(function(error, database) {
            if(error) {
                throw error;
            }
            else {
                that.database = database;
            }
        });
    }

    get(req, res) {
        res.json({});
    }

    post(req, res) {
        const that = this;

        this.database.collection('tags').insertOne({ name: req.body.tag_name }, function(err, result) {
            that.database.collection('receipts').updateOne({ _id: req.body.receipt_id },
                { $set: { tags: [req.body.tag_name] }}, function(err, result) {
                res.json({error: err});
            });
        });
    }
};