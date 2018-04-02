// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {
    // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

    // Code to run if we're in a worker process
} else {
    var express = require('express'),
        bodyParser = require('body-parser'),
        validator = require('express-validator'),
        path = require('path');

    // Get our API routes
    var api = require('./server/routes');

    var app = express();
    var cors = require('cors');

    app.use(cors());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    // parse application/json
    app.use(bodyParser.json());

    // static content
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use(validator()); // required for Express-Validator

    // Set our api routes
    app.use('/api', api(app));

    // Catch all other routes and return the index file
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'dist/index.html'));
    });

    var port = process.env.PORT || 3000;
    var server = require('http').Server(app);
    server.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
