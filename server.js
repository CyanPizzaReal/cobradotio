const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};
const food = [];

const CODES = {
    "CARBON_1892M0AMB": "admin"
};

// food spawn
for (let i = 0; i < 80; i++) {
    food.push({
        x: Math.random() * 3000,
        y: Math.random() * 3000
    });
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

io.on("connection", (socket) => {

    socket.on("join", (data) => {
        players[socket.id] = {
            name: (data.name || "anon").slice(0, 10),
            x: Math.random() * 3000,
            y: Math.random() * 3000,
            angle: 0,
            speed: 3,
            size: 10,
            body: [],
            skin: "green",
            admin: false,
            dashCooldown: 0
        };
    });

    socket.on("code", (code) => {
        const p = players[socket.id];
        if (!p) return;

        if (CODES[code] === "admin") {
            p.admin = true;
        }
    });

    socket.on("admin", (data) => {
        const p = players[socket.id];
        if (!p || !p.admin) return;

        if (data.speed !== undefined) p.speed = data.speed;
        if (data.size !== undefined) p.size = data.size;
        if (data.skin !== undefined) p.skin = data.skin;
    });

    socket.on("input", (data) => {
        const p = players[socket.id];
        if (!p) return;

        p.angle = data.angle;
        p.boost = data.boost;
        p.dash = data.dash;
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });
});

setInterval(() => {

    for (const id in players) {
        const p = players[id];

        // movement
        let speed = p.speed;

        if (p.boost) speed *= 1.6;

        if (p.dash && p.dashCooldown <= 0) {
            speed *= 3;
            p.dashCooldown = 50;
        }

        p.x += Math.cos(p.angle) * speed;
        p.y += Math.sin(p.angle) * speed;

        if (p.dashCooldown > 0) p.dashCooldown--;

        // body follow
        p.body.unshift({ x: p.x, y: p.y });

        if (p.body.length > p.size * 3) {
            p.body.pop();
        }

        // food
        for (let i = 0; i < food.length; i++) {
            if (distance(p, food[i]) < 15) {
                food[i].x = Math.random() * 3000;
                food[i].y = Math.random() * 3000;

                p.size += 0.3;
            }
        }
    }

    io.emit("state", { players, food });

}, 50);

server.listen(process.env.PORT || 3000);
