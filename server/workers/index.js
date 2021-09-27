const express = require('express')
const router = express();
module.exports = router

const axios = require('axios');


const axiosLille = axios.get('https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&q=&rows=10');//api lille
const axiosParis = axios.get('https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes');//api paris
const axiosLyon = axios.get('https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=51fa7fac045a1eb38ee6a6cc8f4c05509c0a9a08');//api lYON
const axiosRennes = axios.get('https://data.rennesmetropole.fr/api/records/1.0/search/?dataset=etat-des-stations-le-velo-star-en-temps-reel&q=&facet=nom&facet=etat&facet=nombreemplacementsactuels&facet=nombreemplacementsdisponibles&facet=nombrevelosdisponibles');//api rennes


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

    res.status(200).json();
})

router.get('/dynamic', (req, res) => {
    updateDynamicDb();

    res.status(200).json();
})


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
    getDLille();
    getDParis();
    getDLyon();
    getDRennes()

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

function updateDynamicDb(){

    setDLille();
    setDParis();
    setDRennes();
    setDLyon();
}


/* ----- PRIVATE FUNCTIONS ----- */

function getDLille(){
    axiosLille.then( response => {
        response.data.records.forEach(function (element){
            var size = element.fields.nbvelosdispo + element.fields.nbplacesdispo;

            //on charge la collection stations_static
            stations_static.insertOne({
                "stationId": element.recordid,
                "city": element.fields.commune.toUpperCase(),
                "name": element.fields.nom.toUpperCase(),
                "geolocation": element.fields.localisation,
                "size": size,
                "tpe": element.fields.type.includes("AVEC TPE"),
                "available": null,
                "updatedAt": element.fields.datemiseajour
            })

            //on charge la collection stations_dynamic
            stations_dynamic.insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": element.fields.nbvelosdispo,
                "docksAvailable": element.fields.nbplacesdispo,
                "createdAt": element.fields.datemiseajour
            })
        })
    })
}

function getDParis(){
    axiosParis.then( response => {
        response.data.records.forEach(function (element){

            //on charge la collection stations_static
            var city = "PARIS";
            stations_static.insertOne({
                "stationId": element.recordid,
                "city": city,
                "name": element.fields.name.toUpperCase(),
                "geolocation": element.fields.coordonnees_geo,
                "size": element.fields.capacity,
                "tpe": element.fields.is_renting.includes("OUI"),
                "available": element.fields.is_installed.includes("OUI"),
                "updatedAt": element.record_timestamp
            })

            //on charge la collection stations_dynamic
            var bikesAvailable = element.fields.capacity - element.fields.numdocksavailable;
            stations_dynamic.insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": bikesAvailable,
                "docksAvailable": element.fields.numdocksavailable,
                "createdAt": element.record_timestamp
            })
        })
    })
}

function getDLyon(){
    axiosLyon.then( response => {
        response.data.forEach(function (element){
            //on charge la collection stations_static
            stations_static.insertOne({
                "stationId": element.number,
                "city": element.contract_name.toUpperCase(),
                "name": element.name.toUpperCase(),
                "geolocation": element.position,
                "size": element.bike_stands,
                "tpe": element.banking,
                "available": element.status.includes("OPEN"),
                "updatedAt": new Date()
            })

            //on charge la collection stations_dynamic
            stations_dynamic.insertOne({
                "stationStaticId": element.number,
                "bikesAvailable": element.available_bikes,
                "docksAvailable": element.available_bike_stands,
                "createdAt": new Date()
            })
        })
    })
}

function getDRennes(){
    var city = "RENNES";
    var tpe = false;
    axiosRennes.then( response => {
        response.data.records.forEach(function (element){
            //on charge la collection stations_static
            stations_static.insertOne({
                "stationId": element.recordid,
                "city": city.toUpperCase(),
                "name": element.fields.nom.toUpperCase(),
                "geolocation": element.fields.coordonnees,
                "size": element.fields.nombreemplacementsactuels,
                "tpe": tpe,
                "available": null,
                "updatedAt": new Date()
            })

            //on charge la collection stations_dynamic
            stations_dynamic.insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": element.fields.nombrevelosdisponibles,
                "docksAvailable": element.fields.nombreemplacementsdisponibles,
                "createdAt": new Date()
            })
        })
    })
}

function setDLille(){
    axiosLille.then(reponse => {
        reponse.data.records.forEach(function (element){
            //on charge la collection stations_dynamic_history
            stations_dynamic.insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": element.fields.nbvelosdispo,
                "docksAvailable": element.fields.nbplacesdispo,
                "createdAt": element.fields.datemiseajour
            })
        })

        //on charge la collection stations_dynamic


    })
}

function setDParis(){
    axiosParis.then(reponse => {
        reponse.data.records.forEach(function (element){
            //on charge la collection stations_dynamic
            //on charge la collection stations_dynamic
            var bikesAvailable = element.fields.capacity - element.fields.numdocksavailable;
            stations_dynamic.insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": bikesAvailable,
                "docksAvailable": element.fields.numdocksavailable,
                "createdAt": element.record_timestamp
            })

        })
    })
}

function setDRennes(){

    axiosRennes.then(reponse => {
        reponse.data.records.forEach(function (element){
            //on charge la collection stations_dynamic
            stations_dynamic.insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": element.fields.nombrevelosdisponibles,
                "docksAvailable": element.fields.nombreemplacementsdisponibles,
                "createdAt": new Date()
            })

        })
    })
}

function setDLyon(){
    axiosLyon.then(reponse => {
        reponse.data.forEach(function (element){
            //on charge la collection stations_dynamic
            stations_dynamic.insertOne({
                "stationStaticId": element.number,
                "bikesAvailable": element.available_bikes,
                "docksAvailable": element.available_bike_stands,
                "createdAt": new Date()
            })

        })

    })
}
