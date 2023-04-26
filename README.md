Hi, this is a technical guide for a NodeJS RESTful data API.
This data API allows a developer to store a list of asset points details to a PostGIS database after receiving a `post` action, and to serve out the information from database after receiving a `get` action. This API can be used within a mobile application or GIS software such as QGIS. 

Table of Contents
- [System Requirement](#system-requirement)
- [Usage](#usage)
  - [Server](#server)
  - [Client side usage](#client-side-usage)
- [Testing](#testing)
- [File Description ](#file-description-)
- [Code reference](#code-reference)
- [Testing details](#testing-details)



## System Requirement<a name='system requirement'></a>
* This API requires to make connection to a Linux Server (Virtual Machine). You could use [Cyberduck](https://cyberduck.io/) or other SSH software to conncet to the Linux Server.
  
* This API is built on an *express* HTTP server in [NodeJS](https://nodejs.dev/en/learn/), which is built on top of the Google Chrome V8 JavaScript engine. Therefore, it is recommended to use [Chrome](https://www.google.com/chrome/bsem/download/en_uk/?brand=VDKB&ds_kid=43700066121069632&gclid=d53981d5ca731eb97766e59df96fa596&gclsrc=3p.ds&utm_source=bing&utm_medium=cpc&utm_campaign=1605158%20%7C%20Chrome%20Win11%20%7C%20DR%20%7C%20ESS01%20%7C%20EMEA%20%7C%20GB%20%7C%20en%20%7C%20Desk%20%7C%20SEM%20%7C%20BKWS%20-%20EXA%20%7C%20Txt%20%7C%20Bing_Top%20KWDS&utm_term=google%20chrome&utm_content=Desk%20%7C%20BKWS%20-%20EXA%20%7C%20Txt_Google%20Chrome%20Top%20KWDS&gclid=d53981d5ca731eb97766e59df96fa596&gclsrc=3p.ds) or [Edge](https://www.microsoft.com/en-gb/edge/download?form=MA13FJ) for client side (web side) deployment.
  
**Important**: To start the server, it is necessary to intall the required packages, which will be discussed later, with [NPM](https://www.npmjs.com/) (node package manager) by running `npm install ` command. 


* Some endpoints of this API require location coordinates as parameters and therefore [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) access via http conncetion. It is recommended to deploy this API using compatiable browsers listed [here](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation#browser_compatibility). 
  
* Due to technical reasons, the API is only accessible to UCL staff and students. If you are going to use this API outside the UCL campus, meaning that you are not connected to the eduroam, make sure you are connceted to the UCL VPN by following instructions [here](https://www.ucl.ac.uk/isd/services/get-connected/ucl-virtual-private-network-vpn).


## Usage<a name="usage"></a>

* Procedures to use this API
### Server
1. Clone the source code of the NodeJS server and corresponding routes from Github repository to your web server. Make sure you have changed your working directory to  *home/studentuser/code* by running  `cd home/studentuser/code` first.Then clone the repository by running `git clone https://github.com/ucl-geospatial-22-23/cege0043-api-22-23-schatty6.git` in your command line.

2. Go to the *home/studentuser/code/cege0043-apps-22-23-schatty6* folder and install `express` package with `npm` by running
   `npm install express -save`

3. Start the server by running 
   `node dataAPI.js`

   **Note**: You can also start the API server by running `pm2 start dataAPI.js`, but it is recommmended to use NodeJS especially if you want to furthter develop this API, as NodeJS provides server side debugging by `console.log(error)` if any error occurs. 
   

### Client side usage
If you want to connect this API to an app, it is recommended to use [jquery](https://jquery.com/) and [promise object](https://www.w3schools.com/Js/js_promise.asp) to deploy this API.

## Testing
Procedures to test this API
1. Make sure your device is connected to UCL eduroam or UCL VPN.
2. Make sure you have started the NodeJS server in your Linux Server.
3. In a browser that supports geolocation access via http connection (eg. [Chrome](https://www.google.com/chrome/bsem/download/en_uk/?brand=VDKB&ds_kid=43700066121069632&gclid=d53981d5ca731eb97766e59df96fa596&gclsrc=3p.ds&utm_source=bing&utm_medium=cpc&utm_campaign=1605158%20%7C%20Chrome%20Win11%20%7C%20DR%20%7C%20ESS01%20%7C%20EMEA%20%7C%20GB%20%7C%20en%20%7C%20Desk%20%7C%20SEM%20%7C%20BKWS%20-%20EXA%20%7C%20Txt%20%7C%20Bing_Top%20KWDS&utm_term=google%20chrome&utm_content=Desk%20%7C%20BKWS%20-%20EXA%20%7C%20Txt_Google%20Chrome%20Top%20KWDS&gclid=d53981d5ca731eb97766e59df96fa596&gclsrc=3p.ds) or [Edge](https://www.microsoft.com/en-gb/edge/download?form=MA13FJ)), type the following URL.
https://cege0043-46.cs.ucl.ac.uk/api
If the API is working successfully, you should see message similar to *'hello world from the Data API'*. 
4. If you want to test the routes created in this API, there are two testing endpoints created.
Type https://cege0043-46.cs.ucl.ac.uk/api/geojson/testGeoJSON and you should see a message of endpoint, similar to *{"message":"/geojson/testGeoJSON"}*;
Type https://cege0043-46.cs.ucl.ac.uk/api/testCRUD and you should see a message of endpoint, similar to *{"message":"/testCRUD GET REQUEST"}*.
Make sure your URL is exactly typed as the endpoint this API provided.

## File Description <a name='file-description'></a>
* **dataAPI.js** : 
  The main file used to create the NodeJS HTTP server for the API. It registers all the routes information within the *~/routes* folder and makes use of them by `app.use('/',route)`;
To allow code on other servers to reference the API, the cross-origin queries were enabled in the app server.
After express server configuration, the connection to database was created by using the NPM project `pg` with the following procedures:
  1. Connect to the pool
  2. return an error if the connection doesn't work
  3. run a query
  4. use done() to release the conncetion back to the pool
  5. Return an error if the quesy has not worked.
  6. Process the results of the query(`res.send`)


* **~/routes** : The sub-directory containing different JavaScript files with routes set up for different functions.
   This API has two *express server routes* ,which were set up by 
   `let router= require('express').Router()` and then `module.exports=route` 
   so they are published to the dataAPI.js server. 

  
  * **geoJSON.js** :The file is created for code to serve GeoJSON from PostGIS database. 
    
  The geoJSON data were generated via the `st_AsGeoJson` functionality provided by PostGIS.
    | Endpoint | Function |Type|
    |----------|----------|----------|
    | /conditionDetails | Get the condition status list|  get |
    | /userAssets/:user_id | get only the geoJSON asset locations for a specific user_id.The user_id is get by using `req.params.xxx` |get|
    |/userConditionReports/:user_id| Tell how many condition reports they have saved, when they add a new condition report (xxxx is the user_id of the particular person).The user_id is get by using `req.params.xxx` |get|
    |/userRanking/:user_id | Provide user their ranking (based on condition reports, in comparison to all other users);The user_id is get by using `req.params.xxx` |get|
    |/assetsInGreatCondition |  List of all the assets with at least one report saying that they are in the best condition |get|
    | /dailyParticipationRates| Return data of rates for the past week (how many reports have been submitted, and how many of these had condition as one of the two 'not working' options) as JSON. |get|
    |/userFiveClosestAssets/:latitude/:longitude | List the 5 assets closest to the user’s current location, added by any user. The latitude and longitude are get by `req.params.xxx`|get|
    |/lastFiveConditionReports/:user_id | List the last 5 reports that the user created. The user_id is get by using `req.params.xxx`  |get|
    | /conditionReportMissing/:user_id| List assets and calculates proximity alerts for assets that the user hasn’t already given a condition report for in the last 3 days |get|


  * *crud.js*:
  The file contains configuration of *express* and conncetion to database for create, read, update and delete operations.   

    | Endpoint | Function |Type|
    |----------|----------|----------|
    |/userId|Get the user_id of the current user.|get|
    |/insertAssetPoint/|Insert information of asset created by user.|post|
    |/insertConditionInformation|Insert information of asset condition|post|
    |/deleteAsset|Delete asset information from database|post|
    |/deleteConditionReport|Delete condition report from database|post|


## Code reference<a name="reference"></a>

A large proportion of codes are adapted from the lab notes of [CEGE0043 Web and Mobile GIS](https://moodle.ucl.ac.uk/course/view.php?id=29666) by [Dr Claire Ellul](https://www.ucl.ac.uk/civil-environmental-geomatic-engineering/people/dr-claire-ellul), including:
   * Code used for building app express server
   * Code used to connect to data base with pg package
   * Code used to handel error that may occur during the server starting period and database conncetion time
   * SQL query string used to retrive data from data base.
  
To enable dynamic data request,the [body-parser](https://www.npmjs.com/package/body-parser) was used to pass parameters in to query and then post to the database.
To connect to the PostGIS database, the [pg](https://www.npmjs.com/package/pg) package was used to process query.
  
## Testing details
The API was tested to ensure optimal performance across multiple platforms and devices. The testing process involved using the latest versions of [Chrome](https://www.google.com/chrome/bsem/download/en_uk/?brand=VDKB&ds_kid=43700066121069632&gclid=d53981d5ca731eb97766e59df96fa596&gclsrc=3p.ds&utm_source=bing&utm_medium=cpc&utm_campaign=1605158%20%7C%20Chrome%20Win11%20%7C%20DR%20%7C%20ESS01%20%7C%20EMEA%20%7C%20GB%20%7C%20en%20%7C%20Desk%20%7C%20SEM%20%7C%20BKWS%20-%20EXA%20%7C%20Txt%20%7C%20Bing_Top%20KWDS&utm_term=google%20chrome&utm_content=Desk%20%7C%20BKWS%20-%20EXA%20%7C%20Txt_Google%20Chrome%20Top%20KWDS&gclid=d53981d5ca731eb97766e59df96fa596&gclsrc=3p.ds) and [Edge](https://www.microsoft.com/en-gb/edge/download?form=MA13FJ) browsers to test the endpoints, as well as running the dataAPI.js file on the Linux Server in Cyberduck to monitor the API's performance. 
The testing process has identified a fully functional API in the lastest Chrome and Edge server.
  


