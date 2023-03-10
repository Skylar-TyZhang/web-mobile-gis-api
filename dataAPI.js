"user strict";
//express is the server that forms part of the nodejs program
let express=require('express');
let  path = require("path");
let  fs = require('fs');    // file system
//add an http server
let  http = require('http');
let  app = express();
//add an https server to serve files
let  httpServer = http.createServer(app);

httpServer.listen(4480);

app.get('/',function(req,res){
    res.send("hello world from the Data API"+Date.now());
});
// to support cross origin req
app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods","GET,PUT,POST,DELETE");
    next();
    
});
// set up cors
// adding CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
   });
// log requests so that it is easier to debug
app.use(function(req,res,next){
    let filename=path.basename(req.url);
    let extension=path.extname(filename);
    console.log("The file "+filename+" was requested.");
    next()
});

// route information
const geoJSON = require('./routes/geoJSON');
app.use('/geojson',geoJSON);

// always the last bit of the file
// app.use(express.static(__dirname));