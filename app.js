var WebSocketServer = require('ws').Server;
var http = require('http');
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var products = require('./products');

var server = http.createServer(app);

server.listen(port);

var wss = new WebSocketServer({server: server});

var productJson = JSON.stringify(products);


wss.on('connection', function(ws) {
  //var id = setInterval(function() {
  //  ws.send(JSON.stringify(new Date()), function() {  });
  //}, 1000);

  //console.log('websocket connection open');

  ws.on('close', function() {
//    console.log('websocket connection close');
//    clearInterval(id);
  });

  ws.on('message', function(data) {
      data = JSON.parse(data);
      if (data.type == "read") {
        ws.send(productJson);
      }
  });

});
