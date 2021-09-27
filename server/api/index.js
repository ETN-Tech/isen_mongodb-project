const express = require('express')
const router = express();

const { MongoClient, ObjectId } = require("mongodb");

let stations_static, stations_dynamic;

MongoClient.connect(process.env.DATABASE_URI, function(err, client) {
    console.log("Connected successfully to MongoDB");

    const db = client.db(process.env.DATABASE_NAME);

    stations_static = db.collection('stations_static');
    stations_dynamic = db.collection('stations_dynamic');
});


/* ----- API ROUTING ----- */

// Handle root
router.get('/', function(req, res) {
    res.status(200).json({
        "message": "OK"
    });
});

router.get('/stations', (req, res) => {
    stations_static.find({}).toArray()
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.get('/stations/find/:name', (req, res) => {
    stations_static.find({
        "name": {
            $regex: req.params.name,
            $options: "ix"
        }
    }).toArray()
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.get('/stations/near/:longitude/:latitude', (req, res) => {
    stations_static.aggregate([
        {
            $geoNear: {
                distanceField: "distance",
                near: {
                    type: "Point",
                    coordinates: [parseFloat(req.params.longitude), parseFloat(req.params.latitude)]
                },
                maxDistance: 1500 // max distance in meters
            }
        },
        {
            $lookup: {
                from: "stations_dynamic",
                localField: "stationId",
                foreignField: "stationStaticId",
                as: "data"
            }
        },
        {
            $project: {
                name: 1,
                data: 1
            }
        }
    ]).toArray()
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        });
})

router.get('/stations/:id', (req, res) => {
    stations_static.findOne({
        _id: ObjectId(req.params.id)
    })
        .then(doc => res.status(200).json(doc))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.get('/stations/activate/:x1/:y1/:x2/:y2', (req, res) => {
    stations_static.updateMany({
        "geolocation": {
            $geoWithin: {
                $box: [
                    [ parseFloat(req.params.x1), parseFloat(req.params.y1) ],
                    [ parseFloat(req.params.x2), parseFloat(req.params.y2) ]
                ]
            }
        }
    }, {
        $set: {
            "available": true
        }
    })
        .then(doc => res.status(200).json(doc))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.get('/stations/deactivate/:x1/:y1/:x2/:y2', (req, res) => {
    stations_static.updateMany({
        "geolocation": {
            $geoWithin: {
                $box: [
                    [ parseFloat(req.params.x1), parseFloat(req.params.y1) ],
                    [ parseFloat(req.params.x2), parseFloat(req.params.y2) ]
                ]
            }
        }
    }, {
        $set: {
            "available": false
        }
    })
        .then(doc => res.status(200).json(doc))
        .catch(err => {
            console.log(err)
            throw err
        })
})

router.post('/stations', (req, res) => {
    stations_static.insertOne({
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

router.put('/stations/:id', (req, res) => {
    stations_static.updateOne({
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

router.delete('/stations/:id', (req, res) => {
    stations_static.deleteOne({
        stationId: req.params.id
    })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })

    stations_dynamic.deleteMany({
        stationStaticId: req.params.id
    })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(err)
            throw err
        })
})

module.exports = router
