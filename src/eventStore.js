#!/usr/bin/env node

/**
 * Module dependencies.
 */
var models = require('./models/index');
var http = require('http');

/**
 * Test data for developement env.
 */

(async () => {
    await models.sequelize.sync({ force: true, logging: false });
    if (process.env.MOCK_DATA) {
        const Storage = require('./storage');
        let storage = new Storage(models);
        if (process.env.MOCK_DATA == 2) {
            var data = require('../test/testData/duplicateEvents.js');
        } else {
            var data = require('../test/mockData.js');
        }
        await storage.onFinalizedBlock(data.finilizedBlockEvent1);
        await storage.onFinalizedBlock(data.finilizedBlockEvent2);
        await storage.onFinalizedBlock(data.finilizedBlockEvent3);
        await storage.onDeployProcessed(data.deployProcessedEvent1);
        await storage.onDeployProcessed(data.deployProcessedEvent2);
        await storage.onDeployProcessed(data.deployProcessedEvent3);
        await storage.onBlockAdded(data.blockAddedEvent1);
        await storage.onBlockAdded(data.blockAddedEvent2);
        await storage.onBlockAdded(data.blockAddedEvent3);
        console.log('Data loaded!');
    };

})();

/**
 * Build the Express app.
 */

const httpServer = require('./httpServer');
app = httpServer(models);

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
