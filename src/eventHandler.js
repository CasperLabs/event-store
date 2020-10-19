class EventHandler {
    constructor(
        stream = require('stream'),
        {promisify} = require('util'),
        util = require('util'),
         
        models = require('./models/index'),
        Storage = require('./storage')
    ) {
        this.stream = stream;
        this.promisify = promisify;
        this.util = util;

        
        this.models = models;
        this.storage = Storage;

        this.eventStream = EventStream;
        this.outputStream = OutputStream;
    }

    async initialiseStream() {
        const pipeline = this.promisify(this.stream.pipeline);

        this.util.inherits(this.outputStream, this.stream.Writable);

        let nodeEventStream = new this.eventStream();
        await this.models.sequelize.sync({ force: true, logging: false });
        let storage = new this.storage(this.models)

        let inputStream = nodeEventStream.stream;
        let outputStream = new this.outputStream(storage);

        try {
            await pipeline(
                inputStream,
                outputStream
            );
        } catch (err) {
            console.error("\n" + err);
        }
    }

}

class EventStream {
    constructor(
        got = require('got'),

        protocol,
        domain,
        port,
        path
    ) {
        this.got = got;

        this.protocol = (protocol !== undefined) ? protocol : 'http';
        this.domain = (domain !== undefined) ? domain : 'localhost';
        this.port = (port !== undefined) ? port : 50101;
        this.path = (path !== undefined) ? path : 'events';
    }

    get url() {
        return (
            this.protocol + "://" + 
            this.domain +
            (this.port 
                ? ":" + this.port
                : "") +
            (this.path
                ? "/" + this.path
                : "") 
            );
    }

    get stream() {
        return this.got.stream(this.url);
    }
}

class OutputStream extends EventHandler{
    constructor(storage) {
        super();
        this.stream.Writable.call(this);
        this.storage = storage;
    }

    async _write(chunk, encoding, done) {

        // Removes 'data:' prefix from the event to convert it to JSON
        let jsonData = JSON.parse(chunk.toString().split("\n")[0].substr(5));
        
        // Raw events
        console.log(jsonData);

        if (jsonData.BlockFinalized) {
            console.log("\nSaving Finalized Block..."); // For debugging
            await this.storage.onFinalizedBlock(jsonData.BlockFinalized);
        } else if (jsonData.BlockAdded) {
            console.log("\nSaving Added Block..."); // For debugging
            await this.storage.onBlockAdded(jsonData.BlockAdded);
        }

        done();
    }
};

// For debugging
let eventHandler = new EventHandler();
eventHandler.initialiseStream();

module.exports = EventHandler;
