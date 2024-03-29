//Import the express and url modules
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');


//The express module is a function. When it is executed it returns an app object
var app = express();


app.use(bodyParser.json());
app.use(session({
cookieName: 'session',
secret: 'krisney',
resave: false,
saveUninitialized: true,
duration: 30 * 60 * 1000,
activeDuration: 5 * 60 * 1000,
httpOnly: true
}));

//Set up express to serve static files from the directory called 'public'
app.use(express.static('public'));

//Start the app listening on port 8080
  app.listen(8080);

app.get('/getraces', function (req, res) {
    //Create a connection object with the user details
    const directoryPath = path.join(__dirname, 'JSON');
    //passsing directoryPath and callback function
    var ret = [];
    var data = [];
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            console.log(file);
            if(file.endsWith('.json')) {
                ret.push(file);
                var d = fs.readFileSync('JSON/'+file);
                console.log(JSON.parse(d));
                data.push(JSON.parse(d));

            }
        });
        res.send(data);
    });
    
    });