'use strict';

///{
///    date: date,
///    user_id: user_id,
///    total: decimal,
///    store: string,
///    items: [
///    {
///        name: string,
///        amount: integer,
///        price_per: decimal,
///    }
///]
///}

module.exports = class Receipt {
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
        console.log(req.query);
        this.database.collection('receipts').find().toArray(function(err, docs) {
            res.json(docs);
        });
    }

    post(req, res) {



        this.database.collection('receipts').insertOne(req.body, function(err, result) {
            if(err === null) {
                res.json({'error': null});
            }
            else {
                res.json({"error": err});
            }
        });
    }
};