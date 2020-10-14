module.exports = {
    finilizedBlockEvent: {
        "proto_block":{
        "hash":"7b25466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c55677",
        "deploys":[
            "abcdef0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
            "0123456fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3"
        ],
        "random_bit":true
        },
        "timestamp":"2020-10-08T12:11:35.808Z",
        "era_end":null,
        "era_id":163,
        "height":1800,
        "proposer":"01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606"
    },

    deployProcessedEvent: {
        "deploy_hash":"abcdef0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
        "block_hash":"7b25466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c55677",
        "execution_result":{
            "effect":{
                "operations":{
                    "hash-8600e2a4e6cd864c2f9f9db207a734081a74cdb88a6a9cb7580281a4b38defae":"Read",
                    "hash-40aa4c817267c46e0a33c671ddb99e4332fe4d22093a8152386beac310e87adf":"Read",
                    "uref-00ab830d669fc666ce78fd196771b6d7c699b2b879c97fde8514b0a92612ecaf-000":"Add",
                    "account-hash-229826c53651b4314bcd8e713873b00749654c979c92a0d938d32f406bb9766b":"Read",
                    "uref-fbf32259191671388f10903a0f1d51ea265e9ead19ebc4c5fc341dfba3bc5e23-000":"Write"
                },
                "transforms":{
                    "uref-fbf32259191671388f10903a0f1d51ea265e9ead19ebc4c5fc341dfba3bc5e23-000":{
                        "WriteCLValue":"0900000008e2b1895d7845630108"
                    },
                    "account-hash-229826c53651b4314bcd8e713873b00749654c979c92a0d938d32f406bb9766b":"Identity",
                    "hash-40aa4c817267c46e0a33c671ddb99e4332fe4d22093a8152386beac310e87adf":"Identity",
                    "uref-00ab830d669fc666ce78fd196771b6d7c699b2b879c97fde8514b0a92612ecaf-000":{
                        "AddUInt512":"9999"
                    },
                    "hash-8600e2a4e6cd864c2f9f9db207a734081a74cdb88a6a9cb7580281a4b38defae":"Identity"
                }
            },
            "cost":"10",
            "error_message":null
        }
    },

    blockAddedEvent: {
        "block_hash":"7b25466409191316db2ad075bf005cba502e2a46f83102bceb736356a9c55677",
        "block_header":{
            "parent_hash":"16815a580c3c1005a7df485e77e31c89e5fb1dec4d57988ffb29f1e699977414",
            "global_state_hash":"cc1b4d3c56f26c63b0683b5d0eb7e165226a05c12e189739c8b477e633582f47",
            "body_hash":"da223b09967c5bd2110743307e0af6d39f61720aa7218a640a08eed12dd575c7",
            "deploy_hashes":[
                "abcdef0fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3",
                "0123456fb356b6d76d2f64a9500ed2cf1d3062ffcf03bb837003c8208602c5d3"
            ],
            "random_bit":true,
            "era_end":null,
            "timestamp":"2020-10-08T12:11:35.808Z",
            "era_id":163,
            "height":1800,
            "proposer":"01d28e8ac5e5a02512c134fecb5cde43755b59d4616e109a4afd6c4f908bf82606"
        }
    }
}

