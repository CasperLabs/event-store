const stream = require('stream');
const {promisify} = require('util');
const util = require('util');
const got = require('got');
 
var models = require('./models/index');
const Storage = require('./storage');

const pipeline = promisify(stream.pipeline);
const nodeEventStream = 'http://localhost:50101/events';
 
var storage;

function OutputStream () {
    stream.Writable.call(this);
};

util.inherits(OutputStream, stream.Writable);

OutputStream.prototype._write = async function (chunk, encoding, done) {
    // CHANGE CODE HERE
    // console.log(JSON.parse(chunk.toString().split("\n")[0].substr(5)));

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