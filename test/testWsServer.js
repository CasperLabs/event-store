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
var storage = null;

describe('WebSocket Server', async () => {
    beforeEach(async () => {
        await models.sequelize.sync({ force: true, logging: false });
        pubsub = new PubSub(redis.createClient());
        storage = new Storage(models, pubsub);
        wsApp = wsServer(pubsub);
        server = wsApp.app.listen(4000);
    });
    
    it('Should handle block stream', (done) => {
        client = new WebSocket('ws://localhost:4000/blocks');
        let responses = [];
        client.on('message', async (block) => {
            responses.push(block);
            let expected1 = {
                blockHash: 'block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                parentHash: '16815a580c3c1005a7df485e77e31c89e5fb1dec4d57988ffb29f1e699977414',
                timestamp: '2020-10-08T12:11:35.808Z',
                eraId: 163,
                proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
                state: 'added',
                height: 1800,
                deploys: [
                    'deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3',
                    'deploy2_6fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3'
                ]
            };
            let expected2 = {
                blockHash: 'block2_09191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                parentHash: 'aacd466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                timestamp: '2020-10-08T12:12:35.808Z',
                eraId: 163,
                proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
                state: 'added',
                height: 1801,
                deploys: []
            };
            try {
                if (responses.length == 1) {
                    assert.deepEqual(JSON.parse(block), expected1);
                } else if (responses.length == 2) {
                    assert.deepEqual(JSON.parse(block), expected2);
                    done();
                };
            } catch (error) {
                done(new Error("Not expected block"));
            }
        });
        client.on('open', async () => {
            await storage.onFinalizedBlock(data.finilizedBlockEvent1);
            await storage.onBlockAdded(data.blockAddedEvent1);
            await storage.onFinalizedBlock(data.finilizedBlockEvent2);
            await storage.onBlockAdded(data.blockAddedEvent2);
        });
    });

    // it('Should handle accountDeploys query', (done) => {
    //     client = new WebSocket('ws://localhost:4000/accountDeploys/1902931231');
    // });
    

    afterEach(async () => {
        client.terminate();
        server.close();
        wsApp.getWss().close();
    });
});