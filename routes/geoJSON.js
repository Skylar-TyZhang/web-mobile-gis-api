//set up database connection 
"user strict";
const express = require('express');
const pg = require('pg');
const geoJSON = require('express').Router();
const fs = require('fs');
// get the username - this will ensure that we can use the same code on multiple machines
const os = require('os');
const userInfo = os.userInfo();
const user707 = userInfo.username;
console.log(user707)
// locate the database login details
const configtext = "" + fs.readFileSync("/home/" + user707 + "/certs/postGISConnection.js");

// now convert the configuration file into the correct format -i.e. a name/value pair array
const configarray = configtext.split(",");
let config = {};
for (let i = 0; i < configarray.length; i++) {
    let split = configarray[i].split(':');
    config[split[0].trim()] = split[1].trim();
}
const pool = new pg.Pool(config);
console.log(config);

// simple test
geoJSON.route('/testGeoJSON').get(function (req, res) {
    console.log('the test runs')
    res.json({ message: req.originalUrl });
});



geoJSON.get('/postgistest', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        client.query(' select * from information_schema.columns', function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

//view data as geoJSON
geoJSON.get('/getSensors', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let querystring = " SELECT 'FeatureCollection' as type, array_to_json(array_agg(f)) As features FROM ";
        querystring = querystring + "(SELECT 'Feature' as type, st_AsGeoJSON(st_transform(lg.locaion,4326))::json as geomery,";
        querystring = querystring + "row_to_json((SELECT l FROM (SELECT sensor_id, sensor_name, sensor_make, sensor_installation_date, room_id)As l)) As properties";
        querystring = querystring + "FROM ucfscde.temperature_sensors As lg LIMIT 100 ) As f";

        client.query(querystring, function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

// last line of the code:export function so the route can be published to the dataAPI.js server
module.exports = geoJSON;