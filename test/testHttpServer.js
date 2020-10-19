var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var models = require('../src/models/index');
const Storage = require('../src/storage');
const httpServer = require('../src/httpServer');
const data = require('./mockData');
chai.use(chaiHttp);

var storge = null;
var app = null;

describe('HttpServer', async () => {
    beforeEach(async () => {
        await models.sequelize.sync({ force: true, logging: false });
        storage = new Storage(models);
        storage.onFinalizedBlock(data.finilizedBlockEvent);
        storage.onBlockAdded(data.blockAddedEvent);
        app = await httpServer(models);
    });
  
    it('It should respond with 404 on unknown block.', async () => {
        let response = await chai.request(app).get('/block/unknown');
        assert.strictEqual(response.res.statusCode, 404);
        assert.strictEqual(response.res.text, "Block not found.");
    });

    // it('It should handle block query.', async () => {
    //     let blockHash = data.blockAddedEvent.block_hash;
    //     let response = await chai.request(app).get(`/block/${blockHash}`);
    //     assert.strictEqual(response.res.statusCode, 404);
    //     assert.strictEqual(response.res.text, "Block not found.");
    // });
});