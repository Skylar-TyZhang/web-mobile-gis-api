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
// always the last bit of the file
app.use(express.static(__dirname));
