const express = require('express')
const router = express();

const velos = require('./data/vlille-realtime.json')

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
            "geolocation": req.body.geolocation,
            "size": req.body.size,
            "name": req.body.name,
            "tpe": req.body.tpe,
            "available": req.body.available
        })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.put('/velos/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let velo = velos.find(velo => velo.recordid === id)
    velo.name = req.body.name
    velo.city = req.body.city
    velo.type = req.body.type
    res.status(200).json(velo)
})

router.delete('/velos/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let velo = velos.find(velo => velo.recordid === id)
    velos.splice(velos.indexOf(velo), 1)
    res.status(200).json(velos)
})


module.exports = router