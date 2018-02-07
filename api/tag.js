'use strict';

module.exports = class Tag {
    static get validator(){
        return {
            $and: [
                { name: { $type: 'string'}}
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
            db.collection('tags').createIndex({ name: 1 }, { unique: true }, function(err, result) {
                if(err) {
                    throw err;
                }
            });
        });
    }

    get(req, res) {
        this.database.collection('tags').find().toArray(function(err, docs) {
            res.json(docs);
        });
    }

    post(req, res) {
        this.database.collection('tags').insertOne(req.body, function(err, result) {
            res.json(err);
        });
    }
};