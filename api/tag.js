'use strict';

module.exports = class Tag {
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
        console.log(req.body);

        res.json({});
    }
};