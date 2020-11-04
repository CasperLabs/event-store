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

    app.ws('/accountDeploys/:account', function(ws, req) {
        console.log(`WSS :: /deploys/${req.params.account} request`);
        pubsub.on_deploy(req.params.account ,(deploy) => {
            console.log("WSS :: callback from PubSub");
            console.log("WSS :: deploy: " + deploy);
            ws.send(deploy);
        });
    });
    
    return wsApp;
}

module.exports = wsServer;