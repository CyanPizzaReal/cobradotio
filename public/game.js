function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const me = state.players[socket.id];
    if (!me) {
        requestAnimationFrame(draw);
        return;
    }

    ctx.save();

    // camera follows player (THIS is the fix)
    ctx.translate(
        canvas.width / 2 - me.x,
        canvas.height / 2 - me.y
    );

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
