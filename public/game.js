const socket = io();
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keys = {};
let state = { players: {}, food: [] };

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function sendInput() {
    let dx = 0, dy = 0;

    if (keys.w) dy -= 5;
    if (keys.s) dy += 5;
    if (keys.a) dx -= 5;
    if (keys.d) dx += 5;

    socket.emit("input", { dx, dy });
}

setInterval(sendInput, 50);

socket.on("state", (s) => {
    state = s;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // food
    ctx.fillStyle = "yellow";
    for (const f of state.food) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // players
    for (const id in state.players) {
        const p = state.players[id];

        ctx.fillStyle = id === socket.id ? "lime" : "red";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

draw();
