class PubSub {
    
    constructor(redisClient) {
        this.publisher = redisClient.duplicate();
        this.subscriber = redisClient.duplicate();
    }

    broadcast_block(block) {
        this.publisher.publish("ws:blocks", JSON.stringify(block));
    }

    broadcast_deploy(deploy) {
        this.publisher.publish("ws:deploys:" + deploy.account, JSON.stringify(deploy));
    }

    on_block(callback) {
        this.subscriber.on("message", (channel, block) => {
            callback(block);
        });
        this.subscriber.subscribe("ws:blocks");
    }

    on_deploy(account, callback) {
        this.subscriber.on("message", (channel, block) => {
            callback(block);
        });
        this.subscriber.subscribe("ws:deploys:" + account);
    }

}

module.exports = PubSub;