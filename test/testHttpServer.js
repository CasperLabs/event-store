var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var models = require('../src/models/index');
const Storage = require('../src/storage');
const httpServer = require('../src/httpServer');
chai.use(chaiHttp);

const data = require('./mockData');
var app = null;

describe('HttpServer', async () => {
    beforeEach(async () => {
        await models.sequelize.sync({ force: true, logging: false });
        storage = new Storage(models);
        await storage.onFinalizedBlock(data.finilizedBlockEvent1);
        await storage.onFinalizedBlock(data.finilizedBlockEvent2);
        await storage.onFinalizedBlock(data.finilizedBlockEvent3);
        await storage.onDeployProcessed(data.deployProcessedEvent1);
        await storage.onDeployProcessed(data.deployProcessedEvent2);
        await storage.onDeployProcessed(data.deployProcessedEvent3);
        await storage.onBlockAdded(data.blockAddedEvent1);
        await storage.onBlockAdded(data.blockAddedEvent2);
        await storage.onBlockAdded(data.blockAddedEvent3);
        app = httpServer(models);
    });
  
    it('Should respond with 404 on unknown block.', async () => {
        let response = await chai.request(app).get('/block/unknown');
        assert.strictEqual(response.statusCode, 404);
        assert.strictEqual(response.text, "Block not found.");
    });

    it('Should handle block query.', async () => {
        let blockHash = data.blockAddedEvent1.block_hash;
        let response = await chai.request(app).get(`/block/${blockHash}`);
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
        let response = await chai.request(app).get('/blocks');
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
        let response = await chai.request(app).get('/deploy/unknown');
        assert.strictEqual(response.statusCode, 404);
        assert.strictEqual(response.text, "Deploy not found.");
    });

    it('Should handle the deploy query.', async () => {
        let deployHash = data.deployProcessedEvent1.deploy_hash;
        let response = await chai.request(app).get(`/deploy/${deployHash}`);
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
        let response = await chai.request(app).get(`/accountDeploys/${account}`);
        console.log(response.body);
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
});