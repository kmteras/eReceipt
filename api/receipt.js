'use strict';

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

    test(req, res) {
        this.database.collection('test').find().toArray(function(err, docs) {
            res.json(docs);
        });
    }
};