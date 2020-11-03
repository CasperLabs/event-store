var express = require('express');
var expressWs = require('express-ws');

let wsServer = (pubsub) => {
    var app = express();
    var wsApp = expressWs(app);

    app.ws('/blocks', function(ws, req) {
        pubsub.on_block( (block) => {
            ws.send(block);
        });
    });
    
    return wsApp;
}

module.exports = wsServer;