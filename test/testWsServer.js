const chai = require('chai');
const WebSocket = require('ws');
const assert = chai.assert;
const models = require('../src/models/index');
const Storage = require('../src/storage');
const wsServer = require('../src/wsServer');
const data = require('./mockData');

var wsApp = null;
var server = null;
var client = null;

describe('WebSocket Server', async () => {
    beforeEach(async () => {
        wsApp = wsServer(models);
        server = wsApp.app.listen(4000);
        client = new WebSocket('ws://localhost:4000/');
    });
  
    it('Should handle', (done) => {
        client.on('open', () => {
            client.send('something');
        });

        client.on('message', async (data) => {
            console.log(data);
            done();
        });
    });

    afterEach(async () => {
        client.terminate();
        server.close();
        wsApp.getWss().close();;
    });
  
});