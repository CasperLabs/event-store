var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var models = require('../src/models/index');
const Storage = require('../src/storage');
const httpServer = require('../src/httpServer');
chai.use(chaiHttp);

const data = require('./mockData');

// For websockets
const WebSocket = require('ws');
const redis =  require('redis-mock');
const PubSub = require('../src/pubsub');
var client = null;
var wsApp = null;
var server = null;

describe('HttpServer', async () => {
    beforeEach(async () => {
        await models.sequelize.sync({ force: true, logging: false });
        pubsub = new PubSub(redis.createClient());
        storage = new Storage(models, pubsub);
        await storage.onFinalizedBlock(data.finalizedBlockEvent1);
        await storage.onFinalizedBlock(data.finalizedBlockEvent2);
        await storage.onFinalizedBlock(data.finalizedBlockEvent3);
        await storage.onDeployProcessed(data.deployProcessedEvent1);
        await storage.onDeployProcessed(data.deployProcessedEvent2);
        await storage.onDeployProcessed(data.deployProcessedEvent3);
        await storage.onBlockAdded(data.blockAddedEvent1);
        await storage.onBlockAdded(data.blockAddedEvent2);
        await storage.onBlockAdded(data.blockAddedEvent3);
        wsApp = httpServer(models, pubsub);
        server = wsApp.app.listen(3000);
    });
  
    it('Should respond with 404 on unknown block.', async () => {
        let response = await chai.request(wsApp.app).get('/block/unknown');
        assert.strictEqual(response.statusCode, 404);
        assert.strictEqual(response.text, "Block not found.");
    });

    it('Should handle block query.', async () => {
        let blockHash = data.blockAddedEvent1.block_hash;
        let response = await chai.request(wsApp.app).get(`/block/${blockHash}`);
        assert.strictEqual(response.statusCode, 200);
        let expected = {
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
        }
        assert.deepEqual(response.body, expected);
    });
    
    it('Should list all the blocks in the height order.', async () => {
        let response = await chai.request(wsApp.app).get('/blocks');
        assert.strictEqual(response.statusCode, 200);
        let expected = {
            data: [
                {
                    blockHash: 'block3_09191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                    parentHash: 'aacd466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                    timestamp: '2020-10-08T12:13:35.808Z',
                    eraId: 163,
                    proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
                    state: 'added',
                    height: 1802,
                    deploys: [
                        "deploy3_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3"
                    ]
                }, {
                    blockHash: 'block2_09191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                    parentHash: 'aacd466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                    timestamp: '2020-10-08T12:12:35.808Z',
                    eraId: 163,
                    proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
                    state: 'added',
                    height: 1801,
                    deploys: []
                }, {
                    blockHash: 'block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
                    parentHash: '16815a580c3c1005a7df485e77e31c89e5fb1dec4d57988ffb29f1e699977414',
                    timestamp: '2020-10-08T12:11:35.808Z',
                    eraId: 163,
                    proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
                    state: 'added',
                    height: 1800,
                    deploys: [
                        "deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
                        "deploy2_6fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3"
                    ]
                }
            ],
            pageCount: 1,
            itemCount: 3,
            pages: [ { number: 1, url: '/blocks?page=1&limit=10' } ]
        }
        assert.deepEqual(expected, response.body);
    });

    it('Should respond with 404 on unknown deploy.', async () => {
        let response = await chai.request(wsApp.app).get('/deploy/unknown');
        assert.strictEqual(response.statusCode, 404);
        assert.strictEqual(response.text, "Deploy not found.");
    });

    it('Should handle the deploy query.', async () => {
        let deployHash = data.deployProcessedEvent1.deploy_hash;
        let response = await chai.request(wsApp.app).get(`/deploy/${deployHash}`);
        assert.strictEqual(response.statusCode, 200);
        let expected = {
            account: "010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932",
            blockHash: "block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111",
            deployHash: 'deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3',
            state: 'processed',
            cost: 11,
            errorMessage: null
        };
        assert.deepEqual(expected, response.body)
    });

    it('Should handle the deploy by account query.', async () => {
        let account = data.deployProcessedEvent1.account;
        let response = await chai.request(wsApp.app).get(`/accountDeploys/${account}`);
        assert.strictEqual(response.statusCode, 200);
        let expected = {
            data:
                [ 
                    { 
                        deployHash: 'deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3',
                        account: '010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932',
                        state: 'processed',
                        cost: 11,
                        errorMessage: null,
                        blockHash: 'block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111' 
                    },
                    { 
                        deployHash: 'deploy2_6fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3',
                        account: '010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932',
                        state: 'processed',
                        cost: 12,
                        errorMessage: null,
                        blockHash: 'block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111' 
                    } 
                ],
                pageCount: 1,
                itemCount: 2,
                pages:
                [ 
                    {
                        number: 1,
                        url: '/accountDeploys/010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932?page=1&limit=10' 
                    } 
                ]
        };
        assert.deepEqual(expected, response.body)
    });

    // it('(WS) Should handle block stream', (done) => {
    //     client = new WebSocket('ws://localhost:3000/ws/blocks');
    //     let responses = [];
    //     client.on('message', async (block) => {
    //         responses.push(block);
    //         let expected1 = {
    //             blockHash: 'block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
    //             parentHash: '16815a580c3c1005a7df485e77e31c89e5fb1dec4d57988ffb29f1e699977414',
    //             timestamp: '2020-10-08T12:11:35.808Z',
    //             eraId: 163,
    //             proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
    //             state: 'added',
    //             height: 1800,
    //             deploys: [
    //                 'deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3',
    //                 'deploy2_6fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3'
    //             ]
    //         };
    //         let expected2 = {
    //             blockHash: 'block2_09191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
    //             parentHash: 'aacd466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111',
    //             timestamp: '2020-10-08T12:12:35.808Z',
    //             eraId: 163,
    //             proposer: '01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606',
    //             state: 'added',
    //             height: 1801,
    //             deploys: []
    //         };
    //         try {
    //             if (responses.length > 2) {
    //                 done();
    //             } else if (responses.length == 1) {
    //                 assert.deepEqual(JSON.parse(block), expected1);
    //             } else if (responses.length == 2) {
    //                 assert.deepEqual(JSON.parse(block), expected2);
    //                 done();
    //             }
    //         } catch (err) {
    //             done(err);
    //         }
    //     });
    //     client.on('open', async () => {
    //         await models.sequelize.sync({ force: true, logging: false });
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent1);
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent2);
    //         await storage.onBlockAdded(data.blockAddedEvent1);
    //         await storage.onBlockAdded(data.blockAddedEvent2);
    //     });
    // });

    it('(WS) Should handle block by block hash query', (done) => {
        let block_hash = data.blockAddedEvent1.block_hash;
        client = new WebSocket(`ws://localhost:3000/ws/block/${block_hash}`);
        client.on('message', async (block) => {
            console.log(JSON.parse(block))
            let expected = {
                blockHash: "block1_6409191316db2ad075bf005cba502e2a46f83102bceb736356a9c51111",
                parentHash: "16815a580c3c1005a7df485e77e31c89e5fb1dec4d57988ffb29f1e699977414",
                timestamp: "2020-10-08T12:11:35.808Z",
                eraId: 163,
                proposer: "01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606",
                state: "added",
                height: 1800,
                deploys: [
                "deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
                "deploy2_6fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3"
                ]
            };
            try {
                assert.deepEqual(JSON.parse(block), expected, "Not expected block");
                done();
            } catch (err) {
                done(err);
            }
        });      
        client.on('open', async () => {
            await models.sequelize.sync({ force: true, logging: false });
            await storage.onFinalizedBlock(data.finalizedBlockEvent1);
            await storage.onFinalizedBlock(data.finalizedBlockEvent2);
            await storage.onFinalizedBlock(data.finalizedBlockEvent3);
            await storage.onBlockAdded(data.blockAddedEvent1);
            await storage.onBlockAdded(data.blockAddedEvent2);
            await storage.onBlockAdded(data.blockAddedEvent3);
        });
    });

    // it('(WS) Should handle deploy by account query', (done) => {
    //     // Proposer's account hash
    //     let account_hash = data.deployProcessedEvent1.account;
    //     client = new WebSocket(`ws://localhost:3000/ws/accountDeploys/${account_hash}`);
    //     let deploys = [];
    //     client.on('message', async (deploy) => {
    //         deploys.push(deploy);
    //         let expected1 =
    //             {
    //               deployHash: "deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
    //               account: "010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932",
    //               state: "processed",
    //               cost: "11",
    //               errorMessage: null,
    //               blockHash: null
    //             }
    //         let expected2 = 
    //             {
    //               deployHash: "deploy2_6fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
    //               account: "010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932",
    //               state: "processed",
    //               cost: "12",
    //               errorMessage: null,
    //               blockHash: null
    //             }
    //         try { 
    //             if (deploys.length == 1) {
    //                 assert.deepEqual(JSON.parse(deploy), expected1, "Not expected deploy1");   
    //             } else if (deploys.length == 2) {
    //                 assert.deepEqual(JSON.parse(deploy), expected2, "Not expected deploy2");
    //                 done();
    //             }
    //         } catch (err) {
    //             done(err);
    //         }
    //     });
    //     client.on('open', async () => {
    //         await models.sequelize.sync({ force: true, logging: false });
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent1);
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent2);
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent3);
    //         await storage.onDeployProcessed(data.deployProcessedEvent1);
    //         await storage.onDeployProcessed(data.deployProcessedEvent2);
    //         await storage.onDeployProcessed(data.deployProcessedEvent3);
    //     });
    // });

    // it('(WS) Should handle deploy by deployHash query', (done) => {
    //     let deployHash = data.deployProcessedEvent1.deploy_hash;
    //     client = new WebSocket(`ws://localhost:3000/ws/deploy/${deployHash}`);
    //     client.on('message', async (deploy) => {
    //         let expected =
    //             {
    //               "deployHash": "deploy1_0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
    //               "account": "010c801c47ed20a9ec40a899ddc7b51a15db2a6c55041313eb0201ae04ee9bf932",
    //               "state": "processed",
    //               "cost": "11",
    //               "errorMessage": null,
    //               "blockHash": null
    //             }
    //         try {
    //             assert.deepEqual(JSON.parse(deploy), expected, "Not expected deploy");
    //             done();
    //         } catch (err) {
    //             done(err);
    //         }
    //     });
    //     client.on('open', async () => {
    //         await models.sequelize.sync({ force: true, logging: false });
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent1);
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent2);
    //         await storage.onFinalizedBlock(data.finalizedBlockEvent3);
    //         await storage.onDeployProcessed(data.deployProcessedEvent1);
    //         await storage.onDeployProcessed(data.deployProcessedEvent2);
    //         await storage.onDeployProcessed(data.deployProcessedEvent3);
    //     });
    // });

    afterEach(async () => {
        if (client !== null) {
            client.terminate();
        }
        pubsub.unsubscribe();
        server.close();
    });
});