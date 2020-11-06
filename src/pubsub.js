class PubSub {
    
    constructor(redisClient) {
        this.publisher = redisClient.duplicate();
        this.subscriber = redisClient.duplicate();
    }

    broadcast_block(block) {
        this.publisher.publish("ws:blocks", JSON.stringify(block));
    }

    broadcast_deploy(deploy) {
        console.log("PUBSUB :: Broadcast Deploy");
        this.publisher.publish("ws:accountdeploys:" + deploy.account, JSON.stringify(deploy));
    }

    on_block(callback) {
        this.subscriber.on("message", (channel, block) => {
            callback(block);
        });
        this.subscriber.subscribe("ws:blocks");
    }

    on_deploy(account, callback) {
        console.log("PUBSUB :: on_deploy for " + account);
        this.subscriber.on("message", (channel, deploy) => {
            callback(deploy);
        });
        this.subscriber.subscribe("ws:accountDeploys:" + account);
    }

}

module.exports = PubSub;