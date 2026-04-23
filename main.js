const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let totalCost = 0;
let player = { x: 400, y: 550, angle: -Math.PI / 2, score: 0, impacts: 0, gameState: "PLAYING" };
let enemies = [];
let bullets = [];
let isFiring = false;
let lastFireTime = 0;
const fireRate = 5; 

const backgroundImage = new Image();
backgroundImage.src = 'dubai-skyline.png'; 

let isImageLoaded = false;
backgroundImage.onload = () => { isImageLoaded = true; };

canvas.addEventListener('mousemove', (e) => {
    if (player.gameState !== "PLAYING") return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
});

canvas.addEventListener('mousedown', () => { if (player.gameState === "PLAYING") isFiring = true; });
canvas.addEventListener('mouseup', () => { isFiring = false; });
canvas.addEventListener('mouseleave', () => { isFiring = false; });

setInterval(() => {
    if (player.gameState !== "PLAYING") return;
    const type = Math.random() > 0.4 ? "DRONE" : "ROCKET";
    enemies.push({
        x: Math.random() * 700 + 50,
        y: -30,
        type: type,
        speed: type === "ROCKET" ? 3.8 : 1.8,
        state: "SPAWN", 
        timer: 0
    });
}, 1200);

function update() {



    
    if (player.gameState !== "PLAYING") return;

    if (isFiring) {
        let now = Date.now();
        if (now - lastFireTime > fireRate) {
            bullets.push({
                x: player.x + Math.cos(player.angle) * 30,
                y: player.y + Math.sin(player.angle) * 30,
                vx: Math.cos(player.angle) * 15,
                vy: Math.sin(player.angle) * 15,
                angle: player.angle
            });
            lastFireTime = now;

             totalCost += 80;
            document.getElementById('total-cost').innerText = "$" + totalCost.toLocaleString();
            
        }
    }

    bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        if (b.y < 0 || b.x < 0 || b.x > 800) bullets.splice(i, 1);
    });

    enemies.forEach((en, ei) => {
        if (en.y > 0 && en.state === "SPAWN") en.state = "DESCEND";
        if (en.type === "DRONE" && en.state === "DESCEND") {
            en.x += Math.sin(en.timer) * 3;
            en.timer += 0.05;
        }
        en.y += en.speed;

        bullets.forEach((b, bi) => {
            if (Math.hypot(b.x - en.x, b.y - en.y) < 20) {
                bullets.splice(bi, 1);
                player.score++;
                enemies.splice(ei, 1);
            }
        });

        if (en.y > 560) {
            player.impacts++;
            enemies.splice(ei, 1);
        }
    });

    if (player.impacts >= 50) player.gameState = "GAME OVER";
    if (player.score >= 200) player.gameState = "VICTORY";
}

function drawDrone(x, y) {
    ctx.fillStyle = "#222";
    ctx.fillRect(x - 25, y - 2, 50, 4); 
    ctx.fillRect(x - 2, y - 12, 4, 24); 
    ctx.fillStyle = "#333";
    ctx.fillRect(x - 10, y + 8, 20, 2); 
    ctx.fillStyle = "#ff0000";
    ctx.beginPath(); ctx.arc(x, y - 10, 2, 0, Math.PI * 2); ctx.fill(); 
}

function drawRocket(x, y) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x, y + 15); ctx.lineTo(x - 6, y - 10); ctx.lineTo(x + 6, y - 10);
    ctx.fill();
    ctx.fillStyle = "#ff4500";
    ctx.fillRect(x - 2, y - 15, 4, 8);
}

function drawDetailedTurret() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "#2b3020";
    ctx.fillRect(-35, 0, 70, 15); 
    ctx.rotate(player.angle + Math.PI / 2);
    ctx.fillStyle = "#4b5320";
    ctx.beginPath();
    ctx.roundRect(-20, -20, 40, 40, [10, 10, 0, 0]); 
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-6, -45, 12, 35); 
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    for(let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-7, -40 + (i * 10)); ctx.lineTo(7, -40 + (i * 10)); ctx.stroke();
    }
    ctx.fillStyle = "#600"; ctx.fillRect(8, -15, 6, 6);
    ctx.fillStyle = "red"; ctx.fillRect(10, -13, 2, 2);
    ctx.restore();
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 600);

    if (isImageLoaded) {
        let scale = Math.max(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
        let x = (canvas.width / 2) - (backgroundImage.width / 2) * scale;
        let y = (canvas.height / 2) - (backgroundImage.height / 2) * scale;
        ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale);
    }

    ctx.fillStyle = "#d35400"; 
    ctx.beginPath(); ctx.moveTo(0, 520); ctx.quadraticCurveTo(400, 490, 800, 520);
    ctx.lineTo(800, 600); ctx.lineTo(0, 600); ctx.fill();

    ctx.fillStyle = "red"; ctx.fillRect(player.x + 40, 530, 8, 40);
    ctx.fillStyle = "green"; ctx.fillRect(player.x + 48, 530, 25, 8);
    ctx.fillStyle = "white"; ctx.fillRect(player.x + 48, 538, 25, 8);
    ctx.fillStyle = "black"; ctx.fillRect(player.x + 48, 546, 25, 8);

    drawDetailedTurret();

    bullets.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.strokeStyle = "#8B0000";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12, 0); ctx.stroke();
        ctx.restore();
    });

    enemies.forEach(en => {
        if (en.type === "DRONE") drawDrone(en.x, en.y);
        else drawRocket(en.x, en.y);
    });

    ctx.fillStyle = "#333";
    ctx.font = "bold 16px Monospace";
    ctx.textAlign = "right";
    ctx.fillText(`TARGETS DESTRUCTED: ${player.score} / 200`, 780, 40);
    ctx.fillStyle = "#b03a2e";
    ctx.fillText(`BASE INTEGRITY THREATS: ${player.impacts} / 50`, 780, 70);

    if (player.gameState !== "PLAYING") {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = player.gameState === "VICTORY" ? "#00ff00" : "#ff0000";
        ctx.font = "bold 48px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(player.gameState, 400, 300);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();