var express = require('express');
var expressWs = require('express-ws');

let wsServer = (pubsub) => {
    var app = express();
    var wsApp = expressWs(app);

    app.ws('/blocks', function(ws, req) {
        pubsub.on_block( (block) => {
            console.log("on block");
            ws.send(block);
        });
        console.log('socket open');
    });
    
    return wsApp;
}

module.exports = wsServer;