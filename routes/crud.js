// configure express
let express = require('express');
let pg = require('pg');
let crud = require('express').Router();
let fs = require('fs');

//create database connection 
let os = require('os');
const userInfo = os.userInfo();
const user707 = userInfo.username;
console.log(user707);
// locate the database login details
let configtext = "" + fs.readFileSync("/home/" + user707 + "/certs/postGISConnection.js");

// now convert the configruation file into the correct format -i.e. a name/value pair array
let configarray = configtext.split(",");
let config = {};
for (let i = 0; i < configarray.length; i++) {
    let split = configarray[i].split(':');
    config[split[0].trim()] = split[1].trim();
}
let pool = new pg.Pool(config);
console.log(config);

// add data parser functionality to the API 
// so that NodeJS code can read through the individual name/value pairs
const bodyParser = require('body-parser');
crud.use(bodyParser.urlencoded({ extended: true }));
// add a route '/testCRUD' with 2 endpoints
// one for get
// one for post
// test endpoint for GET requests (can be called from a browser URL or AJAX)
crud.get('/testCRUD', function (req, res) {
    res.json({ message: req.originalUrl + " " + "GET REQUEST" });
});

// test endpoint for POST requests - can only be called from AJAX
crud.post('/testCRUD', function (req, res) {
    res.json({ message: req.body });
});
// Add endpoints to get userID
crud.get('/userId', function(req, res){
    //res.json({message:req.originalUrl + " " + "GET REQUEST>"});
    pool.connect(function(err, client,done){
        if (err){
            console.log("Not able to get connection "+ err);
            res.status(400).send(err);
        }
    var querystring='select user_id from ucfscde.users where user_name = current_user;'
    client.query(querystring, function(err, result){
        done();
        if (err){
            console.log(err);
            res.status(400).send(err);
        }
        res.status(200).send(result.rows);
    })
    })
});
// Added endpoint for insert functionality
crud.post('/insertAssetPoint', function (req, res) {
    res.json({ message: req.body });
});

// end of the file
module.exports= crud;
