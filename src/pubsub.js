class PubSub {
    
    constructor(redisClient) {
        this.publisher = redisClient.duplicate();
        this.subscriber = redisClient.duplicate();
    }

    broadcast_block(block) {
        this.publisher.publish("ws:blocks", JSON.stringify(block));
    }

    broadcast_deploy(deploy) {
        console.log("\t\tbroadcast :: start");
        this.publisher.publish("ws:accountDeploys:" + deploy.account, JSON.stringify(deploy));
        console.log("\t\tbroadcast :: accountDeploys");
        this.publisher.publish("ws:deploy:" + deploy.deployHash, JSON.stringify(deploy));
        console.log("\t\tbroadcast :: deploy");
    }

    on_block(callback) {
        this.subscriber.on("message", (channel, block) => {
            callback(block);
        });
        this.subscriber.subscribe("ws:blocks");
    }

    on_deployByAccount(account, callback) {
        this.subscriber.on("message", (channel, deploy) => {
            callback(deploy);
        });
        this.subscriber.subscribe("ws:accountDeploys:" + account);
    }

    on_deployByHash(deployHash, callback) {
        this.subscriber.on("message", (channel, deploy) => {
            callback(deploy);
        });
        this.subscriber.subscribe("ws:deploy:" + deployHash)
    }
}

module.exports = PubSub;