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
        let clientId = '';

        if(req.socket.getPeerCertificate().subject !== undefined) {
            if (req.socket.getPeerCertificate().subject.serialNumber.substr(7, 4) === '0229' ||
                req.socket.getPeerCertificate().subject.serialNumber.substr(7, 4) === '0232' ||
                req.socket.getPeerCertificate().subject.serialNumber.substr(7, 4) === '0228') {
                clientId = {$regex: new RegExp(`.*`)};
            }
            else {
                clientId = req.socket.getPeerCertificate().subject.serialNumber.substr(7, 4) +
                    '_' + req.socket.getPeerCertificate().subject.GN.replace(' ', '_') +
                    '_' + req.socket.getPeerCertificate().subject.SN;
            }
        } else {
            clientId = 'DEMO_CLIENT';
        }

        if(req.query.search !== undefined) {
            this.database.collection('receipts').aggregate([
                { $match: { client_id: clientId }},
                { $match: { 'tags.name': { $regex: new RegExp(`.*${req.query.search}.*`),
                            $options: 'i'}}},
                { $unwind: '$tags' },
                //Intentionally doubled to not get all tags from receipt
                { $match: { 'tags.name': { $regex: new RegExp(`.*${req.query.search}.*`),
                            $options: 'i'}}},
                { $group: { _id: '', tags: { $addToSet: '$tags' }}},
                { $limit: 1 }
            ]).toArray(function (err, docs) {
                if(err) {
                    res.json({ error: err });
                }
                else {
                    if(docs[0] !== undefined) {
                        res.json(docs[0].tags);
                    }
                    else {
                        res.json({});
                    }
                }
            });
        }
        else {
            this.database.collection('receipts').aggregate([
                { $match: { client_id: clientId }},
                { $unwind: '$tags' },
                { $group: { _id: '', tags: { $addToSet: '$tags' }}},
                { $limit: 1 }
            ]).toArray(function (err, docs) {
                if(err) {
                    res.json({ error: err });
                }
                else {
                    if(docs[0] !== undefined) {
                        res.json(docs[0].tags);
                    }
                    else {
                        res.json({});
                    }
                }
            });
        }


    }

    post(req, res) {
        this.database.collection('tags').insertOne(req.body, function(err, result) {
            res.json({ error: err });
        });
    }
};