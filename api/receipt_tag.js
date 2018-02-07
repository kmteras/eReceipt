'use strict';

const ObjectID = require('mongodb').ObjectID;

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

    delete(req, res) {
        this.database.collection('receipts').updateOne({ _id: new ObjectID(req.body.receipt_id) },
            {
                $pull: {
                    tags:
                        {
                            name: req.body.tag_name
                        }
                }
            }, function (err, result) {
                res.json({error: err, result: result});
            });
    }

    post(req, res) {
        const that = this;

        this.database.collection('tags').insertOne({ name: req.body.tag_name }, function(err, result) {
                //Error 11000 - duplicate tag, we don't care about that
                if(err && err.code !== 11000) {
                    res.json(err);
                }
                else {
                    that.database.collection('receipts').updateOne({ _id: new ObjectID(req.body.receipt_id) },
                        {
                            $pull: {
                                tags:
                                    {
                                        name: req.body.tag_name
                                    }
                            }
                        }, function (err, result) {
                        that.database.collection('receipts').updateOne({ _id: new ObjectID(req.body.receipt_id) },
                            {
                                $push: {
                                    tags:
                                        {
                                            name: req.body.tag_name
                                        }
                                }
                            }, function (err, result) {
                                res.json({error: err, result: result});
                            });
                        });

                }
        });
    }
};