var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Storage = require('./storage');
// var indexRouter = require('../routes/index');
// var usersRouter = require('../routes/users');

let httpServer = async (models) => {
    var storage = new Storage(models);
    var app = express();
    
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    
    app.get('/block/:blockHash', async (req, res, next) => {
        let block = await storage.findBlockByHash(req.params.blockHash);
        if (block === null) {
            res.status(404).send("Block not found.");
        } else {
            res.send("asd");
        }
    });

    app.use(function (req,res,next){
        res.status(404).send('Unable to find the requested resource!');
    });
    
    return app;
}


module.exports = httpServer;
