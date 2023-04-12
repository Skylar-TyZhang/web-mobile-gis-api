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
        var querystring = "SELECT 'FeatureCollection'";
        querystring = querystring + " as type, array_to_json(array_agg(f)) As features ";
        querystring = querystring + " FROM (SELECT 'Feature' As type , ST_AsGeoJSON(st_transform(lg.location,4326))::json As geometry , ";
        querystring = querystring + "row_to_json((SELECT l FROM (SELECT sensor_id, sensor_name, sensor_make, sensor_installation_date, room_id) as l)) As properties FROM ucfscde.temperature_sensors As lg limit 100)  ";
        querystring = querystring + "  As f";

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

// flexible way to get data from differernt table
geoJSON.get('/:schemaname/:tablename/:idcolumn/:geomcolumn', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let colnames = "";
        // first get a list of the columns that are in the table
        // use string_agg to generate a comma separated list that can be pasted into th enext query
        let tablename = req.params.tablename;
        let schema = req.params.schemaname;
        let idcolumn = req.params.idcolumn;
        let geomcolumn = req.params.geomcolumn;
        let geomcolumnJSON = JSON.stringify(geomcolumn);
        let tablenameJSON = schema + "." + tablename;

        let querystring = "select string_agg(colname,',') from (select column_name as colname";
        querystring = querystring + " from information_schema.columns as colname";
        querystring = querystring + " where table_name = $1";
        querystring = querystring + " and column_name <>$2 and table_schema=$3 and data_type<>'USER-DEFINED') as cols";
        console.log(querystring);

        // now run the query
        client.query(querystring, [tablename, geomcolumn, schema],
            function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                }
                thecolnames = result.rows[0].string_agg;
                colnames = thecolnames;
                console.log('===run the query=====')
                console.log("the colnames " + thecolnames);

                // SQL injection prevention : check ithat the ID column exists
                if (thecolnames.toLowerCase().indexOf(idcolumn.toLowerCase()) > -1) {
                    let cols = colnames.split(",");
                    let colString = "";
                    for (let i = 0; i < cols.length; i++) {
                        console.log(cols[i]);
                        colString = colString + JSON.stringify(cols[i]) + ",";
                    }
                    console.log('======check column strings=======')
                    console.log(colString);
                    //remove the extra comma
                    colString = colString.substring(0, colString.length - 1);
                    // now use the inbuilt geoJSON functionality
                    // and create the required geoJSON format using a query adapted from here:
                    // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSONFeature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
                    // note that query needs to be a single string with no line breaks so built it up bit by bit
                    // to overcome the polyhedral surface issue, convert them to simple geometries
                    // assume that all tables have an id field for now - to do add the name of the id field as a parameter
                    querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
                    querystring += "(select 'Feature' as type, x.properties, st_asgeojson(y.geometry):: json as geometry from ";
                    querystring += " (select " + idcolumn + ", row_to_json((SELECT l FROM(SELECT " + colString + ") As l )) as properties FROM " + schema + "." + JSON.stringify(tablename);
                    querystring += " ) x";
                    querystring += " inner join (SELECT " + idcolumn + ", c.geom as geometry";
                    querystring += " FROM ( SELECT " + idcolumn + ",(ST_Dump(st_transform(" + geomcolumn + ", 4326))).geom AS geom ";

                    querystring += " FROM " + schema + "." + JSON.stringify(tablename) + ") c) y on y." + idcolumn + " = x." + idcolumn + ") f";
                    console.log(querystring);

                    client.query(querystring, function (err, result) {
                        //call `done()` to release the client back to the pool
                        done();
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        }
                        // remove the extra [ ] from the GeoJSON as this won't work with QGIS
                        let geoJSONData = JSON.stringify(result.rows);
                        geoJSONData = geoJSONData.substring(1);
                        geoJSONData = geoJSONData.substring(0, geoJSONData.length - 1);
                        console.log(geoJSONData);
                        res.status(200).send(JSON.parse(geoJSONData));
                    }); // end of the geoJSON query
                } // the ID column name isn't in the list - so there is some attempt at injection 
                else {
                    res.status(400).send("Invalid ID column name");

                }
            }); // end of query to list all columns
    });// end of the pool 
});// end of function

// add endpoint to get the condition status list for the drop down on the form
// ENDPOINT
geoJSON.get('/conditionDetails', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        var querystring = "select * from cege0043.asset_condition_options;";


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


//-- Code to get only the geoJSON asset locations for a specific user_id
// Use when first loading the web page and also when another layer is removed
// Reference A2
geoJSON.get('/userAssets/:user_id', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let user_id = req.params.user_id
        var colnames = "asset_id, asset_name, installation_date, latest_condition_report_date, condition_description";

        // now use the inbuilt geoJSON functionality
        // and create the required geoJSON format using a query adapted from here:
        // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018

        // note that query needs to be a single string with no line breaks so built it up bit by bit
        var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        querystring += "row_to_json((SELECT l FROM (SELECT " + colnames + " ) As l      )) As properties";
        querystring += "   FROM cege0043.asset_with_latest_condition As lg ";
        querystring += " where user_id = $1 limit 100  ) As f ";
        console.log('Query string: ' + querystring)
        client.query(querystring, [user_id], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});
//Reference A3
// Tell user how my condition reports they have saved when they add a new condition report
geoJSON.get('/userConditionReports/:user_id', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let user_id = req.params.user_id
        
        // note that query needs to be a single string with no line breaks so built it up bit by bit
        var querystring = "select array_to_json (array_agg(c)) from (SELECT COUNT(*) AS num_reports from cege0043.asset_condition_information where user_id = $1) c;"
        
        console.log('Query string: ' + querystring)
        client.query(querystring, [user_id], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});
// Reference S1
geoJSON.get('/userRanking/:user_id', function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }
        let user_id = req.params.user_id
        
        // note that query needs to be a single string with no line breaks so built it up bit by bit
        var querystring = "select array_to_json (array_agg(hh)) from"+
        "(select c.rank from (SELECT b.user_id, rank()over (order by num_reports desc) as rank"+ 
        "from (select COUNT(*) AS num_reports, user_id from cege0043.asset_condition_information group by user_id) b) c where c.user_id = $1) hh"
        
        console.log('Query string: ' + querystring)
        client.query(querystring, [user_id], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });
});

//======================================
// last line of the code:export function so the route can be published to the dataAPI.js server
module.exports = geoJSON;