const express = require('express')
const router = express();
module.exports = router

const axios = require('axios');

const apiLille = 'https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&q=&rows=10';
const apiParis = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes';
const apiLyon = 'https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=51fa7fac045a1eb38ee6a6cc8f4c05509c0a9a08';
const apiRennes = 'https://data.rennesmetropole.fr/api/records/1.0/search/?dataset=etat-des-stations-le-velo-star-en-temps-reel&q=&facet=nom&facet=etat&facet=nombreemplacementsactuels&facet=nombreemplacementsdisponibles&facet=nombrevelosdisponibles';


// MongoDB database connection
const { MongoClient } = require("mongodb");

let db, stations_static, stations_dynamic;

MongoClient.connect(process.env.DATABASE_URI, function(err, client) {
    console.log("Connected successfully to MongoDB");

    db = client.db(process.env.DATABASE_NAME);

    stations_static = db.collection('stations_static');
    stations_dynamic = db.collection('stations_dynamic');
});


/* ---- API ROUTING ----- */

router.get('/static', (req, res) => {
    createStaticDb();

    res.status(200).json('OK');
})

let autoUpdate = false;
let requestLoop;

router.get('/dynamic', (req, res) => {
    autoUpdate = !autoUpdate;

    if (autoUpdate) {
        console.log('> Started automatic update');
        // execute updateDynamicDb every minute
        requestLoop = setInterval(updateDynamicDb, 60000);
    } else {
        clearInterval(requestLoop);
        console.log('> Stopped automatic update');
    }

    res.status(200).json(autoUpdate? 'OK, Started automatic update' : 'OK, Stopped automatic update');
});

router.get('/dynamic/clear', (req, res) => {
    // Clear collection
    stations_dynamic.drop()
        .then(() => console.log('Dropped dynamic'))
        .catch(err => {
            console.log(err)
            throw err
        });
    db.createCollection("stations_dynamic")
        .then(() => console.log('Created dynamic'))
        .catch(err => {
            console.log(err)
            throw err
        });
    stations_dynamic = db.collection('stations_dynamic');

    res.status(200).json('Cleared dynamic');
});


/* ----- ENTRYPOINT FUNCTIONS ----- */

function createStaticDb() {
    // Clear collection
    stations_static.drop()
        .then(() => console.log('Dropped static'))
        .catch(err => {
            console.log(err)
            throw err
        });
    db.createCollection("stations_static")
        .then(() => console.log('Created static'))
        .catch(err => {
            console.log(err)
            throw err
        });
    stations_static = db.collection('stations_static');

    // charger les informations des 4 villes
    createStaticLille();
    createStaticParis();
    createStaticLyon();
    createStaticRennes()

    // Create geospatial index
    stations_static.createIndex({"geolocation": "2dsphere"})
        .then(() => console.log("Created index on 'geolocation'"))
        .catch(err => {
            console.log(err)
            throw err
        });
    stations_static.createIndex({"name": "text"})
        .then(() => console.log("Created index on 'name'"))
        .catch(err => {
            console.log(err)
            throw err
        });
}

function updateDynamicDb (){
    console.log('Updating dynamic...');

    stations_static.find({}).toArray()
        .then(stations => {
            // update each station dynamic infos
            stations.forEach(station => {
                if (station.city === "LILLE") {
                    createRecordLille(station.stationId);
                }
                else if (station.city === "PARIS") {
                    createRecordParis(station.stationId);
                }
                else if (station.city === "RENNES") {
                    createRecordRennes(station.stationId);
                }
                else if (station.city === "LYON") {
                    createRecordLyon(station.stationId);
                }
            })
        })
        .catch(err => {
            console.log(err)
            throw err
        });
}


/* ----- PRIVATE FUNCTIONS ----- */

/* CREATE STATIC */

function createStaticLille() {
    axios.get(apiLille)
        .then(res => {
            res.data.records.forEach(elem => {
                stations_static.insertOne({
                    "stationId": elem.fields.libelle,
                    "city": "LILLE",
                    "name": elem.fields.nom.toUpperCase(),
                    "geolocation": elem.fields.localisation,
                    "size": elem.fields.nbvelosdispo + elem.fields.nbplacesdispo,
                    "tpe": elem.fields.type.includes("AVEC TPE"),
                    "available": true,
                    "updatedAt": elem.fields.datemiseajour
                })
            })
        })
}

function createStaticParis() {
    axios.get(apiParis)
        .then(res => {
            res.data.records.forEach(elem => {
                stations_static.insertOne({
                    "stationId": elem.fields.stationcode,
                    "city": "PARIS",
                    "name": elem.fields.name.toUpperCase(),
                    "geolocation": elem.fields.coordonnees_geo,
                    "size": elem.fields.capacity,
                    "tpe": elem.fields.is_renting.includes("OUI"),
                    "available": elem.fields.is_installed.includes("OUI"),
                    "updatedAt": elem.record_timestamp
                })
            })
        })
}

function createStaticLyon() {
    axios.get(apiLyon)
        .then(res => {
            res.data.forEach(elem => {
                stations_static.insertOne({
                    "stationId": elem.number,
                    "city": elem.contract_name.toUpperCase(),
                    "name": elem.name.toUpperCase(),
                    "geolocation": [elem.position.lat, elem.position.lng],
                    "size": elem.bike_stands,
                    "tpe": elem.banking,
                    "available": elem.status.includes("OPEN"),
                    "updatedAt": new Date()
                })
            })
        })
}

function createStaticRennes() {
    axios.get(apiRennes)
        .then(res => {
            res.data.records.forEach(elem => {
                stations_static.insertOne({
                    "stationId": elem.fields.idstation,
                    "city": "RENNES",
                    "name": elem.fields.nom.toUpperCase(),
                    "geolocation": elem.fields.coordonnees,
                    "size": elem.fields.nombreemplacementsactuels,
                    "tpe": false,
                    "available": true,
                    "updatedAt": new Date()
                })
            })
        })
}

/* CREATE RECORDS (DYNAMIC) */

function createRecordLille(stationId) {
    axios.get('https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&q=&refine.libelle='+ stationId)
        .then(res => {
            res.data.records.forEach(elem => {
                stations_dynamic.insertOne({
                    "stationStaticId": elem.recordid,
                    "bikesAvailable": elem.fields.nbvelosdispo,
                    "docksAvailable": elem.fields.nbplacesdispo,
                    "createdAt": elem.fields.datemiseajour
                })
            })
        })
}

function createRecordParis(stationId) {
    axios.get('https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&refine.stationcode='+ stationId)
        .then(res => {
            res.data.records.forEach(elem => {
                stations_dynamic.insertOne({
                    "stationStaticId": elem.recordid,
                    "bikesAvailable": elem.fields.capacity - elem.fields.numdocksavailable,
                    "docksAvailable": elem.fields.numdocksavailable,
                    "createdAt": elem.record_timestamp
                })
            })
        })
}

function createRecordLyon(stationId) {
    axios.get('https://api.jcdecaux.com/vls/v3/stations/'+ stationId +'?contract=Lyon&apiKey=51fa7fac045a1eb38ee6a6cc8f4c05509c0a9a08')
        .then(res => {
            res.data.records.forEach(elem => {
                stations_dynamic.insertOne({
                    "stationStaticId": elem.number,
                    "bikesAvailable": elem.available_bikes,
                    "docksAvailable": elem.available_bike_stands,
                    "createdAt": new Date()
                })
            })
        })
}

function createRecordRennes(stationId) {
    axios.get('https://data.rennesmetropole.fr/api/records/1.0/search/?dataset=stations_vls&q=&refine.idstation='+ stationId)
        .then(res => {
            res.data.records.forEach(elem => {
                stations_dynamic.insertOne({
                    "stationStaticId": elem.recordid,
                    "bikesAvailable": elem.fields.nombrevelosdisponibles,
                    "docksAvailable": elem.fields.nombreemplacementsdisponibles,
                    "createdAt": new Date()
                })
            })
        })
}
