var assert = require('chai').assert;
var models = require('../src/models/index');
const Storage = require('../src/storage');
const data = require('./mockData');

var storge = null;

describe('Storage', async () => {
    beforeEach(async () => {
        await models.sequelize.sync({ force: true, logging: false });
        storage = new Storage(models);
    });
  
    it('Should handle BlockFinilized event', async () => {
        let e = data.finilizedBlockEvent;
        await storage.onFinalizedBlock(e);
        
        let block = await storage.findBlockByHeight(e.height);

        assert.strictEqual(block.blockHeight, e.height);
        assert.strictEqual(block.timestamp.toISOString(), e.timestamp);
        assert.strictEqual(block.eraId, e.era_id);
        assert.strictEqual(block.proposer, e.proposer);
        assert.strictEqual(block.state, 'finalized');
        assert.isNull(block.blockHash)
        assert.isNull(block.parentHash)

        let deploys = await block.getDeploys();

        assert.strictEqual(deploys[0].deployHash, e.proto_block.deploys[0]);
        assert.strictEqual(deploys[0].blockHeight, e.height);
        assert.strictEqual(deploys[0].state, 'finalized');
        
        assert.strictEqual(deploys[1].deployHash, e.proto_block.deploys[1]);
        assert.strictEqual(deploys[1].blockHeight, e.height);
        assert.strictEqual(deploys[1].state, 'finalized');
    });

    it('Should handle DeployProcessed event', async () => {
        await storage.onFinalizedBlock(data.finilizedBlockEvent);

        let e = data.deployProcessedEvent;
        await storage.onDeployProcessed(e);

        let deploy = await storage.findDeployByHash(e.deploy_hash);
        assert.strictEqual(deploy.cost, parseInt(e.execution_result.cost));
        assert.strictEqual(deploy.errorMessage, e.execution_result.error_message);
        assert.strictEqual(deploy.state, 'processed');
    });

    it('Should handle BlockAdded event', async () => {
        await storage.onFinalizedBlock(data.finilizedBlockEvent);
        let e = data.blockAddedEvent;
        await storage.onBlockAdded(e);

        let block = await storage.findBlockByHash(e.block_hash);
        assert.strictEqual(block.state, 'added');
        assert.strictEqual(block.parentHash, e.block_header.parent_hash);
    });
});
