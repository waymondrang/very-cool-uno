const express = require('express')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 80;
const http = require('http');
const { MongoClient } = require('mongodb');
const socket = require('socket.io');
const uri = process.env.MONGO_URI;
const deck = require("./deck.json")

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

(async () => {
    await client.connect();
    await client.db("uno").collection("games").deleteMany({})
})()

const server = http.createServer(app)

app.use(express.static('./build', { setHeaders: function (response, path, stat) { response.set("Cache-Control", "no-store") }, maxAge: '0', etag: false }));

app.get('*', function (request, response) {
    response.set({ "Cache-Control": "no-store" })
    response.set({ "etag": false })
    response.sendFile('/index.html', { 'root': './build' })
})

/**
app.use(express.static(__dirname + "/build"))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/build/index.html")
    return
})
*/

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const ioexpress = require('express')();
const ioserver = http.createServer(ioexpress);
const io = socket(ioserver, { cors: { allow: "*" } });
io.listen(65080, () => console.log("socket io server listening on port 65080"));


io.on('connection', function (socket) {
    console.log('user connected to socket', socket.handshake.address)
    socket.on('join-room', async function (data) {
        var room = data.room;
        var username = data.username;
        console.log('user', username, 'on socket', socket.id, 'connected to room', room)
        socket.join(room)
        var results = await client.db("uno").collection("games").findOne({ _id: room }, { projection: { playerOrder: 1 } })
        var playerOrder = results ? results["playerOrder"] : [];
        playerOrder.push({ [socket.id]: { username: username } })
        client.db("uno").collection("games").updateOne({ _id: room }, { $set: { [socket.id]: { "username": username, "cards": [] }, playerOrder: playerOrder } }, { upsert: true })
        socket.emit("joined-room", { room: room })
        io.sockets.in(room).emit("player-order", { playerOrder: playerOrder })
        socket.to(room).broadcast.emit('user-connected', { username: username, socketid: `${socket.id}` })
        socket.on('disconnect', async () => {
            console.log('user', username, 'on socket', socket.id, 'disconnected from room', room)
            var results = await client.db("uno").collection("games").findOne({ _id: room }, { projection: { playerOrder: 1 } })
            var playerOrder = results ? results["playerOrder"] : [];
            var index = playerOrder.map(e => Object.keys(e)[0]).indexOf(socket.id)
            playerOrder.splice(index, 1)
            console.log("playerOrder", playerOrder)
            if (!playerOrder.length) {
                client.db("uno").collection("games").deleteOne({ _id: room });
            } else {
                client.db("uno").collection("games").updateOne({ _id: room }, { $unset: { [socket.id]: 1 }, $set: { playerOrder: playerOrder } })
                io.sockets.in(room).emit('user-disconnected', { username: username, socketid: socket.id, playerOrder: playerOrder })
            }
        })
    })
    socket.on('user-update', function (data) {
        socket.to(data.room).broadcast.emit('user-update', { username: data.username, socketid: socket.id })
    })
    socket.on("start-game", async function (data) {
        var room = data.room;
        if (!room) {
            return
        }
        await client.db("uno").collection("games").updateOne({ _id: room }, { $set: { gamestarted: true, publicdeck: deck, currentcard: [], reverse: false } }, { upsert: true })
        console.log(`game start request from room`, data.room)
        console.log(io.sockets.adapter.rooms[`${data.room}`])
        io.sockets.in(room).emit('game-started', { length: deck.length })
    })
    socket.on("draw-card", async function (data) {
        var room = data.room;
        var result = await client.db("uno").collection("games").findOne({ _id: room }, { projection: { publicdeck: 1 } })
        if (!result["publicdeck"]) {
            return
        }
        var cards = result["publicdeck"];
        io.sockets.in(room).emit('publicdeck-update', { length: cards.length === 0 ? 0 : cards.length - 1 })
        if (cards.length < 1) {
            socket.to(room).broadcast.emit('player-hand-update', { socket: socket.id, count: data.count })
            console.log("no more cards!")
            return
        }
        var draw = cards[randint(0, cards.length - 1)];
        socket.emit("card-drew", { draw: draw })
        socket.to(room).broadcast.emit('player-hand-update', { socket: socket.id, count: data.count + 1 })
        var index = cards.map(e => Object.keys(e)[0]).indexOf(Object.keys(draw)[0]);
        cards.splice(index, 1);
        await client.db("uno").collection("games").updateOne({ _id: room }, { $set: { publicdeck: cards } })
        return
        await client.db("uno").collection("games").updateOne({ _id: room }, { $set: { gamestarted: true, publicdeck: deck, currentcard: {} } }, { upsert: true })
        console.log(`game start request from room`, data.room)
        console.log(io.sockets.adapter.rooms[`${data.room}`])
        socket.to(room).broadcast.emit('game-started')
    })
    socket.on("use-card", async function (data) {
        //console.log(data.count)
        var card = data.card;
        var room = data.room;
        var result = await client.db("uno").collection("games").findOne({ _id: room }, { projection: { reverse: 1 } })
        card[Object.keys(card)[0]]["player"] = data.player;
        var reverse = result["reverse"];
        if (card[Object.keys(card)[0]]["card"]) {
            if (card[Object.keys(card)[0]]["card"].toLowerCase() === "reverse") {
                reverse = !result["reverse"];
                await client.db("uno").collection("games").updateOne({ _id: room }, { $set: { reverse: reverse } })
            }
        }
        //console.log(card)
        //var result = await client.db("uno").collection("games").findOne({ _id: room }, { projection: { currentcard: 1 } })
        //var current = result["currentcard"]
        //current.push(card)
        //console.log(reverse)
        io.sockets.in(room).emit('currentcard-update', { card: card, reverse: reverse })
        socket.to(room).broadcast.emit('player-hand-update', { socket: socket.id, count: data.count })
    })
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

server.listen(port, () => console.log(`http server is running on port: ${port}`));