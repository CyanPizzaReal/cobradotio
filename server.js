const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};
const food = [];

// spawn food
for (let i = 0; i < 50; i++) {
    food.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000
    });
}

io.on("connection", (socket) => {
    players[socket.id] = {
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: 10,
        speed: 4,
        score: 0
    };

    socket.on("input", (data) => {
        const p = players[socket.id];
        if (!p) return;

        p.dx = data.dx;
        p.dy = data.dy;
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });
});

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

setInterval(() => {
    // move players
    for (const id in players) {
        const p = players[id];

        p.x += p.dx || 0;
        p.y += p.dy || 0;

        // food collision
        for (let i = 0; i < food.length; i++) {
            if (distance(p, food[i]) < 15) {
                food[i].x = Math.random() * 2000;
                food[i].y = Math.random() * 2000;

                p.size += 1;
                p.score += 1;
            }
        }
    }

    io.emit("state", { players, food });
}, 50);

server.listen(process.env.PORT || 3000);
