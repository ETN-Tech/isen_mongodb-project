const express = require('express')
const router = express();

const velos = require('../data/vlille-realtime.json')


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


router.get('/lille', (req, res) => {
    let data;
    const axios = require('axios');

    // TODO request data from VLille API


    //on charge notre api
    axios.get('https://opendata.lillemetropole.fr/api/records/1.0/search/?dataset=vlille-realtime&q=&rows=252')
        .then(response => {

            //on recupere les valeurs qui nous interreses au moyen d'un foreach dans reponse
            response.data.records.forEach(function (element){
                //on charge les information dans la bd

                //on charge la collection stations_static
                var size = element.fields.nbvelosdispo + element.fields.nbplacesdispo;
                db.collection('stations_static').insertOne({
                    "stationId": element.recordid,
                    "city": element.fields.commune,
                    "name": element.fields.nom,
                    "geolocation": element.geometry,
                    "size": size,
                    "tpe": element.fields.type,
                    "available": null,
                    "updatedAt": element.fields.datemiseajour
                })
                    .then(docs => res.status(200).json(docs))
                    .catch(err => {
                        console.log(err)
                        throw err
                    })

                //on charge la collection stations_static


            })
        })
        .catch(error => {
            console.log(error);
        });

    res.status(200).json(data);
})


module.exports = router
