const socket = io();

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let state = { players: {}, food: [] };
let angle = 0;

let keys = {};
let playing = false;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function startGame() {
    const name = document.getElementById("name").value.slice(0, 10);

    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";

    socket.emit("join", { name });
    playing = true;
}

socket.on("state", s => state = s);

// mouse aim
window.addEventListener("mousemove", (e) => {
    if (!playing) return;

    let dx = e.clientX - canvas.width / 2;
    let dy = e.clientY - canvas.height / 2;

    angle = Math.atan2(dy, dx);
});

// code system
function submitCode() {
    const code = prompt("enter code");
    socket.emit("code", code);
}

// input loop
setInterval(() => {
    if (!playing) return;

    socket.emit("input", {
        angle,
        boost: keys.shift,
        dash: keys[" "]
    });

}, 50);

function draw() {
    requestAnimationFrame(draw);

    if (!playing) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const me = state.players[socket.id];
    if (!me) return;

    ctx.save();
    ctx.translate(canvas.width/2 - me.x, canvas.height/2 - me.y);

    // food
    ctx.fillStyle = "yellow";
    for (const f of state.food) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI*2);
        ctx.fill();
    }

    // players + snake body
    for (const id in state.players) {
        const p = state.players[id];

        ctx.fillStyle = id === socket.id ? "lime" : "red";

        for (let i = 0; i < p.body.length; i += 5) {
            const b = p.body[i];
            ctx.beginPath();
            ctx.arc(b.x, b.y, p.size/2, 0, Math.PI*2);
            ctx.fill();
        }
    }

    ctx.restore();

    drawUI(me);
}

function drawUI(me) {
    // leaderboard
    const top = Object.values(state.players)
        .sort((a,b) => b.size - a.size)
        .slice(0,5);

    ctx.fillStyle = "white";
    ctx.fillText("leaderboard", 20, 20);

    top.forEach((p,i) => {
        ctx.fillText(`${i+1}. ${p.name} - ${Math.floor(p.size)}`, 20, 40 + i*20);
    });

    // minimap
    ctx.strokeStyle = "white";
    ctx.strokeRect(canvas.width - 150, 20, 120, 120);
}
