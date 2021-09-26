const express = require('express')
const router = express();
module.exports = router

const axios = require('axios');
const {response} = require("express");
//const velos = require('../data/vlille-realtime.json');

const axiosLille = axios.get('https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&q=&rows=10');//api lille
const axiosParis = axios.get('https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes');//api paris
//const axiosLyon = axios.get('https://download.data.grandlyon.com/ws/rdata/sit_sitra.sittourisme/all.json?maxfeatures=100&start=1');//api lYON
const axiosRennes = axios.get('https://data.rennesmetropole.fr/api/records/1.0/search/?dataset=etat-des-stations-le-velo-star-en-temps-reel&q=&facet=nom&facet=etat&facet=nombreemplacementsactuels&facet=nombreemplacementsdisponibles&facet=nombrevelosdisponibles');//api rennes

// MongoDB database connection
const { MongoClient, ObjectId } = require("mongodb");

let stations_static, stations_dynamic;

MongoClient.connect(process.env.DATABASE_URI, function(err, client) {
    console.log("Connected successfully to MongoDB");

    const db = client.db(process.env.DATABASE_NAME);

    stations_static = db.collection('stations_static');
    stations_dynamic = db.collection('stations_dynamic');
});


router.get('/ville', (req, res) => {

    // TODO request data from VLille API
    GetDataVille();
    SetDataVille();
    res.status(200).json();
})


function SetDataVille(){
    setDLille();
    setDParis();
    setDRennes();
}

function setDLille(){
    axiosLille.then(reponse => {
            reponse.data.records.forEach(function (element){
                var size = element.fields.nbvelosdispo + element.fields.nbplacesdispo;
                //on charge la collection stations_dynamic_history
                db.collection('stations_static')
                    .updateOne(
                        {"stationId": element.recordid}, // Filter
                        {$set: {

                                "city": element.fields.commune.toUpperCase(),
                                "name": element.fields.nom.toUpperCase(),
                                "geolocation": element.fields.localisation,
                                "size": size,
                                "tpe": element.fields.type.includes("AVEC TPE"),
                                "available": null,
                                "updatedAt": element.fields.datemiseajour
                            }} // Update
                    )
                    .then((obj) => {
                        console.log('Updated - ' + obj);
                        response.redirect('orders')
                    })
                    .catch((err) => {
                        console.log('Error: ' + err);
                    })
                    db.collection('stations_dynamic').insertOne({
                    "stationId": element.recordid,
                    "bikesAvailable": element.fields.nbvelosdispo,
                    "docksAvailable": element.fields.nbplacesdispo,
                    "createdAt": element.fields.datemiseajour
                })
            })

                //on charge la collection stations_dynamic


            })

        .catch(error => {
            console.log(error);
        });
}

function setDParis(){
    axiosParis.then(reponse => {
        reponse.data.records.forEach(function (element){
            //on charge la collection stations_dynamic_history
            db.collection('stations_static')
                .updateOne(
                    {"stationId": element.recordid}, // Filter
                    {$set: {
                            "city": element.fields.nom_arrondissement_communes.toUpperCase(),
                            "name": element.fields.name.toUpperCase(),
                            "geolocation": element.fields.coordonnees_geo,
                            "size": element.fields.capacity,
                            "tpe": element.fields.is_renting.includes("OUI"),
                            "available": element.fields.is_installed.includes("OUI"),
                            "updatedAt": element.record_timestamp
                        }} // Update
                )
                .then((obj) => {
                    console.log('Updated - ' + obj);
                    response.redirect('orders')
                })
                .catch((err) => {
                    console.log('Error: ' + err);
                })


            //on charge la collection stations_dynamic
            var bikesAvailable = element.fields.capacity - element.fields.numdocksavailable;
            db.collection('stations_dynamic').insertOne({
                "stationId": element.recordid,
                "bikesAvailable": bikesAvailable,
                "docksAvailable": element.fields.numdocksavailable,
                "createdAt": element.record_timestamp
            })

        })
    })
        .catch(error => {
            console.log(error);
        });
}

function setDRennes(){
    var city = "RENNES";
    var tpe = false;
    axiosRennes.then(reponse => {
        reponse.data.records.forEach(function (element){
            //on charge la collection stations_dynamic_history
            db.collection('stations_static')
                .updateOne(
                    {"stationId": element.recordid}, // Filter
                    {$set: {
                            "city": city.toUpperCase(),
                            "name": element.fields.nom.toUpperCase(),
                            "geolocation": element.fields.coordonnees,
                            "size": element.fields.nombreemplacementsactuels,
                            "tpe": tpe,
                            "available": null,
                            "updatedAt": element.fields.lastupdate
                        }} // Update
                )
                .then((obj) => {
                    console.log('Updated - ' + obj);
                    response.redirect('orders')
                })
                .catch((err) => {
                    console.log('Error: ' + err);
                })

            //on charge la collection stations_dynamic
            db.collection('stations_dynamic').insertOne({
                "stationId": element.recordid,
                "bikesAvailable": element.fields.nombrevelosdisponibles,
                "docksAvailable": element.fields.nombreemplacementsdisponibles,
                "createdAt": element.fields.lastupdate
            })

        })
    })
        .catch(error => {
            console.log(error);
        });
}

function GetDataVille(){
    //on va charger les informations de nous 4 villes ici;
    getDLille();
    getDParis();
    getDLyon();
    getDRennes()
}


function getDLille(){
    axiosLille.then( response => {
        response.data.records.forEach(function (element){
            var size = element.fields.nbvelosdispo + element.fields.nbplacesdispo;
            //on charge la collection stations_static
            db.collection('stations_static').insertOne({
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
            db.collection('stations_dynamic').insertOne({
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
            db.collection('stations_static').insertOne({
                "stationId": element.recordid,
                "city": element.fields.nom_arrondissement_communes.toUpperCase(),
                "name": element.fields.name.toUpperCase(),
                "geolocation": element.fields.coordonnees_geo,
                "size": element.fields.capacity,
                "tpe": element.fields.is_renting.includes("OUI"),
                "available": element.fields.is_installed.includes("OUI"),
                "updatedAt": element.record_timestamp
            })

            //on charge la collection stations_dynamic
            var bikesAvailable = element.fields.capacity - element.fields.numdocksavailable;
            db.collection('stations_dynamic').insertOne({
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
            db.collection('stations_static').insertOne({
                "stationId": element.number,
                "city": element.contractName.toUpperCase(),
                "name": element.name.toUpperCase(),
                "geolocation": element.position,
                "size": element.totalStands.capacity,
                "tpe": element.banking,
                "available": element.connected,
                "updatedAt": element.lastUpdate
            })

            //on charge la collection stations_dynamic
            db.collection('stations_dynamic').insertOne({
                "stationStaticId": element.number,
                "bikesAvailable": element.totalStands.availabilities.bikes,
                "docksAvailable": element.totalStands.availabilities.stands,
                "createdAt": element.lastUpdate
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
            db.collection('stations_static').insertOne({
                "stationId": element.recordid,
                "city": city.toUpperCase(),
                "name": element.fields.nom.toUpperCase(),
                "geolocation": element.fields.coordonnees,
                "size": element.fields.nombreemplacementsactuels,
                "tpe": tpe,
                "available": null,
                "updatedAt": element.fields.lastupdate
            })

            //on charge la collection stations_dynamic
            db.collection('stations_dynamic').insertOne({
                "stationStaticId": element.recordid,
                "bikesAvailable": element.fields.nombrevelosdisponibles,
                "docksAvailable": element.fields.nombreemplacementsdisponibles,
                "createdAt": element.fields.lastupdate
            })
        })
    })
}







