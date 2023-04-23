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

//--------------------------Add endpoints----------------------------------------
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
crud.get('/userId', function (req, res) {
    //res.json({message:req.originalUrl + " " + "GET REQUEST>"});
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to get connection " + err);
            res.status(400).send(err);
        }
        var querystring = 'select user_id from ucfscde.users where user_name = current_user;'
        client.query(querystring, function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        })
    })
});
// Added endpoint for insert functionality
crud.post('/insertAssetPoint', function (req, res) {
    pool.connect(function (err, client, done) {
        //console.log('Connect to the database.')

        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }

        let asset_name = req.body.asset_name;
        let installation_date = req.body.installation_date;

        let geometrystring = "st_geomfromtext('POINT(" + req.body.longitude + " " + req.body.latitude + ")',4326)";

        let querystring = "INSERT into cege0043.asset_information (asset_name, installation_date, location) values ";
        querystring += "($1,$2,";
        querystring += geometrystring + ")";


        client.query(querystring, [asset_name, installation_date], function (err, result) {
            done();

            if (err) {
                console.log(err);
                console.log(err.message);
                //console.log('result of asset insertion:'+result);
                res.status(200).send(err);
            }
            else{
            res.
            status(200).send(result)}
            //("Form Data " + req.body.asset_name + " has been inserted");}
        });

    });
})
// Add endpoint for conditionInformation Insert
crud.post('/insertConditionInformation', function (req, res) {
    pool.connect(function (err, client, done) {
        console.log('Connect to the database.')

        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }

        let asset_name = req.body.asset_name;
        let condition_description = req.body.condition_description;

        var querystring = "INSERT into cege0043.asset_condition_information (asset_id, condition_id) values (";
        querystring += "(select id from cege0043.asset_information where asset_name = $1),(select id from cege0043.asset_condition_options where condition_description = $2))";



        client.query(querystring, [asset_name, condition_description], function (err, result) {
            done();

            if (err) {
                res.status(400).send(err);
            }
            res.status(200).send("Condition form for " + req.body.asset_name + " has been inserted");
        });

    });
})
//delete function
crud.post('/deleteAsset', function (req, res) {
    pool.connect(function (err, client, done) {
        console.log('Connect to the database.')

        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let id=req.body.id;


        var querystring = "DELETE from cege0043.asset_information where id = $1";
        client.query(querystring, [id], function (err, result) {
            done();

            if (err) {
                res.status(400).send(err);
            }
            res.status(200).send("Asset with id " + req.body.id + " has been deleted");
        });

    });
})
//delete condition report
crud.post('/deleteConditionReport', function (req, res) {
    pool.connect(function (err, client, done) {
        console.log('Connect to the database.')

        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let id=req.body.id;


        var querystring = "DELETE from cege0043.asset_condition_information where id = $1";
        client.query(querystring, [id], function (err, result) {
            done();

            if (err) {
                res.status(400).send(err);
            }
            res.status(200).send("Asset with id " + req.body.id + " has been deleted");
        });

    });
})









//-------------------------
// end of the file
module.exports = crud;
