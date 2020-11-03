const chai = require('chai');
const WebSocket = require('ws');
const redis = require("redis-mock");
const assert = chai.assert;

const models = require('../src/models/index');
const Storage = require('../src/storage');
const wsServer = require('../src/wsServer');
const PubSub = require('../src/pubsub');

const data = require('./mockData');

var wsApp = null;
var server = null;
var client = null;
var pubsub = null;

describe('WebSocket Server', async () => {
    beforeEach(async () => {
        pubsub = new PubSub(redis.createClient());
        wsApp = wsServer(pubsub);
        server = wsApp.app.listen(4000);
    });
    
    it('Should handle block stream', (done) => {
        client = new WebSocket('ws://localhost:4000/blocks');
        client.on('message', async (block) => {
            // assert
            done(new Error("ss"));
        });
        client.on('open', () => {
            pubsub.on_block(123);
        })
    });

    afterEach(async () => {
        client.terminate();
        server.close();
        wsApp.getWss().close();
    });
});