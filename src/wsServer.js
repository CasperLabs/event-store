var express = require('express');
var expressWs = require('express-ws');

let wsServer = (models) => {
    var app = express();
    var wsApp = expressWs(app);

    app.ws('/', function(ws, req) {
        ws.on('message', function(msg) {
            ws.send("hej");
        });
        console.log('socket open');
    });

    return wsApp;
}

module.exports = wsServer;