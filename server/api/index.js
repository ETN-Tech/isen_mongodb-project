const express = require('express')
const router = express();

const velos = require('../data/vlille-realtime.json')
const {ObjectId} = require("mongodb");

// Handle root
router.get('/', function(req, res) {
    res.status(200).json({
        "message": "OK"
    });
});

/**
 * Import MongoClient & connexion à la DB
 */
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'veloland';
let db

MongoClient.connect(url, function(err, client) {
    console.log("Connected successfully to MongoDB");
    db = client.db(dbName);
});

router.get('/velos', (req, res) => {
    db.collection('stations').find({}).toArray()
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
        //res.status(200).json(velos)
})

router.get('/velos/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const velo = velos.find(velo => velo.recordid === id)
    res.status(200).json(velo)
})

router.post('/velos', (req, res) => {
    db.collection('stations').insertOne({
        "stationId": req.body.stationId,
        "city": req.body.city,
        "name": req.body.name,
        "geolocation": req.body.geolocation,
        "size": req.body.size,
        "tpe": req.body.tpe,
        "available": req.body.available,
        "updatedAt": new Date()
        })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.put('/velos/:id', (req, res) => {
    db.collection('stations').updateOne({
        _id: ObjectId(req.params.id)
    }, {
        $set : {
            stationId: req.body.stationId,
            city: req.body.city,
            name: req.body.name,
            geolocation: req.body.geolocation,
            size: req.body.size,
            tpe: req.body.tpe,
            available: req.body.available,
            updatedAt: new Date()
        }
    })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.delete('/velos/:id', (req, res) => {
    db.collection('stations').deleteOne({
        _id: ObjectId(req.params.id)
    })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

module.exports = router
