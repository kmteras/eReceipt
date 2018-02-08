'use strict';

module.exports = class Tag {
    static get validator(){
        return {
            $and: [
                { name: { $type: 'string' }}
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
        db.createCollection('tags', {validator: Tag.validator}, function(err, result) {
            if(err) {
                throw err;
            }
            db.collection('tags').createIndex({ name: 'text' }, { unique: true }, function(err, result) {
                if(err) {
                    throw err;
                }
            });
        });
    }

    get(req, res) {
        let request_data = {};

        if(req.query.search !== undefined) {
            request_data = { name: new RegExp(`.*${req.query.search}.*`) };
        }

        this.database.collection('tags').find(request_data).toArray(function(err, docs) {
            res.json(docs);
        });
    }

    post(req, res) {
        this.database.collection('tags').insertOne(req.body, function(err, result) {
            res.json({ error: err });
        });
    }
};