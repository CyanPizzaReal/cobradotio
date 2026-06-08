const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};
const food = [];

for (let i = 0; i < 50; i++) {
    food.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000
    });
}

io.on("connection", (socket) => {

    socket.on("join", (data) => {
        players[socket.id] = {
            name: (data.name || "anon").slice(0, 10),
            x: Math.random() * 2000,
            y: Math.random() * 2000,
            angle: 0,
            size: 10,
            speed: 3,
            score: 0
        };
    });

    socket.on("input", (data) => {
        const p = players[socket.id];
        if (!p) return;

        p.angle = data.angle;
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });
});

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

setInterval(() => {
    for (const id in players) {
        const p = players[id];

        // ALWAYS MOVE FORWARD
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        // food collision
        for (let i = 0; i < food.length; i++) {
            if (distance(p, food[i]) < 15) {
                food[i].x = Math.random() * 2000;
                food[i].y = Math.random() * 2000;

                p.size += 0.5;
                p.score += 1;
            }
        }
    }

    io.emit("state", { players, food });
}, 50);

server.listen(process.env.PORT || 3000);
