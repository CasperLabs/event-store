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

    app.ws('/deploy/:deployHash', function(ws, req) {
        pubsub.on_deployByHash(req.params.deployHash, (deploy) => {
            console.log("\twss :: sending deploy to endpoint")
            ws.send(deploy)
        });
    });

    app.ws('/accountDeploys/:account', function(ws, req) {
        pubsub.on_deployByAccount(req.params.account , (deploy) => {
            ws.send(deploy);
        });
    });
    
    return wsApp;
}

module.exports = wsServer;