var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();
var port = process.env.PORT || 5000;
var products = require("./products");

var clients = [];

function broadcast(except, request) {
    var data = JSON.stringify(request);

    for (var index = 0; index < clients.length; index++) {
        var client = clients[index];

        if (client !== except && client.readyState === 1) {
            client.send(data);
        }
    }
}

function send(ws, request) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify(request));
    }
}

function guid() {
    var id = "", i, random;

    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            id += "-";
        }
        id += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return id;
}

products.forEach(function(product, index) {
    var date = new Date();
    date.setTime(index);
    product.CreatedAt = date;
});

var server = http.createServer(app);

server.listen(port);

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws) {
    clients.push(ws);

    ws.on("close", function() {
        var index = clients.indexOf(ws);

        if (index >= 0) {
            clients.splice(index, 1);
        }
    });

    ws.on("message", function(data) {
        var request = JSON.parse(data);

        if (request.type == "read") {
            request.data = products;

            send(ws, request);
        } else if (request.type == "update" || request.type == "destroy") {
            send(ws, request);

            request.type = "push-" + request.type;

            broadcast(ws, request);
        } else if (request.type == "create") {
            request.data[0].CreatedAt = new Date();

            request.data[0].ProductID = guid();

            send(ws, request);

            request.type = "push-create";

            broadcast(ws, request);
        }
    });
});
