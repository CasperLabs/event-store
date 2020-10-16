const stream = require('stream');
const {promisify} = require('util');
const util = require('util');
const got = require('got');
 
var models = require('./models/index');
const Storage = require('./storage');

const pipeline = promisify(stream.pipeline);
const nodeEventStream = 'http://localhost:50101/events';
 
var storage;

class OutputStream {
    constructor() {
        stream.Writable.call(this);
    }
    async _write(chunk, encoding, done) {

        let jsonData = JSON.parse(chunk.toString().split("\n")[0].substr(5));

        if (jsonData.BlockFinalized) {
            console.log("Saving Finalized Block...");
            await storage.onFinalizedBlock(jsonData.BlockFinalized);
        } else if (jsonData.BlockAdded) {
            console.log("Saving Added Block...");
            await storage.onBlockAdded(jsonData.BlockAdded);
        }

        done();
    }
};

util.inherits(OutputStream, stream.Writable);

const outputStream = new OutputStream();

(async () => {
    
    await models.sequelize.sync({ force: true, logging: false });
    storage = new Storage(models);

    try {
        await pipeline(
            // Source stream
            got.stream(nodeEventStream),
            // Output stream
            outputStream
        );
    } catch (err) {
        console.error("\n" + err);
    }
})();