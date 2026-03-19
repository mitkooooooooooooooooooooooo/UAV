const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let player = { x: 400, y: 550, score: 0, hits: 0 };
let enemies = [];
let bullets = [];

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && player.x > 20) player.x -= 25;
    if (e.key === 'ArrowRight' && player.x < 780) player.x += 25;
});

canvas.addEventListener('mousedown', () => {
    bullets.push({ x: player.x, y: player.y });
});

setInterval(() => {
    enemies.push({ 
        x: Math.random() * 760 + 20, 
        y: -20, 
        type: Math.random() > 0.5 ? "DRONE" : "ROCKET",
        speed: Math.random() * 2 + 1
    });
}, 1500);

function update() {
    bullets.forEach((b, i) => {
        b.y -= 7;
        if (b.y < 0) bullets.splice(i, 1);
    });

    enemies.forEach((en, ei) => {
        en.y += en.speed;

        bullets.forEach((b, bi) => {
            if (Math.hypot(b.x - en.x, b.y - en.y) < 20) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                player.score++;
            }
        });

        if (en.y > 600) {
            enemies.splice(ei, 1);
            player.hits++;
        }
    });
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(player.x - 20, player.y, 40, 20);
    ctx.fillRect(player.x - 5, player.y - 10, 10, 10);

    ctx.fillStyle = 'cyan';
    bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 10));

    enemies.forEach(en => {
        ctx.fillStyle = en.type === "ROCKET" ? "orange" : "red";
        ctx.beginPath();
        ctx.arc(en.x, en.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(en.type, en.x - 20, en.y - 15);
    });

    ctx.fillStyle = "white";
    ctx.font = "18px Monospace";
    ctx.textAlign = "right";
    ctx.fillText(`KILLS: ${player.score}`, 780, 30);
    ctx.fillText(`MISSES: ${player.hits}`, 780, 55);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();