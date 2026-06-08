const socket = io();

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let state = { players: {}, food: [] };
let angle = 0;
let playing = false;

function startGame() {
    const name = document.getElementById("name").value.slice(0, 10);

    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";

    socket.emit("join", { name });

    playing = true;
}

// mouse controls direction
window.addEventListener("mousemove", (e) => {
    if (!playing) return;

    const dx = e.clientX - canvas.width / 2;
    const dy = e.clientY - canvas.height / 2;

    angle = Math.atan2(dy, dx);
});

socket.on("state", (s) => {
    state = s;
});

function sendInput() {
    if (!playing) return;

    socket.emit("input", { angle });
}

setInterval(sendInput, 50);

function draw() {
    if (!playing) {
        requestAnimationFrame(draw);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const me = state.players[socket.id];
    if (!me) {
        requestAnimationFrame(draw);
        return;
    }

    ctx.save();
    ctx.translate(canvas.width / 2 - me.x, canvas.height / 2 - me.y);

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
        ctx.arc(p.x, p.y, p.size || 10, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    requestAnimationFrame(draw);
}

draw();
