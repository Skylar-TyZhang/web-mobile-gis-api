"user strict";
//express is the server
let express=require('express');
let  path = require("path");
let  fs = require('fs');    // file system
let  http = require('http');
let  app = express();
//add an https server to serve files
let  httpServer = http.createServer(app);

httpServer.listen(4480);
app.get('/',function(req,res){
    res.send("hello world from the Data API");
});
// to support cross origin req
app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods","GET,PUT,POST,DELETE");
    next();
    
});

// to log requests
app.use(function(req,res,next){
    let filename=path.basename(req.url);
    let extension=path.extname(filename);
    console.log("The file"+filename+"was requested.");
});
// always the last bit of the file
app.use(express.static(__dirname));
// route information
const geoJSON = require('./routes/geoJSON');
app.use('/geojson', geoJSON);