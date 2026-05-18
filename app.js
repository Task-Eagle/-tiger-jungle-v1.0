const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const jumpBtn = document.getElementById('jumpBtn');

let score = 0;
let gameActive = true;
let speedMultiplier = 1;

// Configuración del Tigre
const tiger = {
    x: 60,
    y: 200,
    width: 50,
    height: 50,
    gravity: 0.6,
    velocity: 0,
    jumpForce: -13,
    groundY: 200,
    isJumping: false,
    draw() {
        ctx.font = '55px serif';
        ctx.fillText('🐅', this.x, this.y + 45);
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocity = 0;
            this.isJumping = false;
        }
    },
    jump() {
        if (!this.isJumping) {
            this.velocity = this.jumpForce;
            this.isJumping = true;
        }
    }
};

// Obstáculos (Selva)
let obstacles = [];
const obstacleEmojis = ['🌿', '🪨', '🐍', '🍄'];

function spawnObstacle() {
    if (Math.random() < 0.015 && obstacles.length < 2) {
        const emoji = obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)];
        obstacles.push({
            x: canvas.width,
            y: tiger.groundY + 15,
            width: 35,
            height: 35,
            speed: (6 + score * 0.005) * speedMultiplier,
            emoji: emoji
        });
    }
}

// Fondo creativo (Efecto Parallax)
let backgroundItems = [];
const bgEmojis = ['🌴', '🌳', '🌺', '🌱'];

function spawnBackground() {
    if (Math.random() < 0.02 && backgroundItems.length < 8) {
        const emoji = bgEmojis[Math.floor(Math.random() * bgEmojis.length)];
        backgroundItems.push({
            x: canvas.width,
            y: 120 + Math.random() * 80,
            speed: 2,
            emoji: emoji,
            size: 35 + Math.random() * 25
        });
    }
}

function checkCollision(rect1, rect2) {
    // Caja de colisión ligeramente más pequeña para mejor jugabilidad (hitbox justa)
    return rect1.x < rect2.x + rect2.width - 15 &&
           rect1.x + rect1.width - 15 > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function resetGame() {
    score = 0;
    obstacles = [];
    backgroundItems = [];
    tiger.y = tiger.groundY;
    tiger.velocity = 0;
    gameActive = true;
    gameOverEl.classList.add('hidden');
    scoreEl.innerText = `Puntos: ${score}`;
    animate();
}

function animate() {
    if (!gameActive) return;

    // Dibujar cielo/atmósfera de la selva
    ctx.fillStyle = '#1a4331';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el suelo suelo fangoso/jungle floor
    ctx.fillStyle = '#081c15';
    ctx.fillRect(0, tiger.groundY + 45, canvas.width, canvas.height - tiger.groundY);

    // Renderizar fondo (Parallax)
    spawnBackground();
    backgroundItems.forEach((item, index) => {
        item.x -= item.speed;
        ctx.font = `${item.size}px serif`;
        ctx.fillText(item.emoji, item.x, item.y);
        if (item.x < -60) backgroundItems.splice(index, 1);
    });

    // Actualizar y dibujar Tigre
    tiger.update();
    tiger.draw();

    // Renderizar Obstáculos
    spawnObstacle();
    obstacles.forEach((obs, index) => {
        obs.x -= obs.speed;
        ctx.font = '45px serif';
        ctx.fillText(obs.emoji, obs.x, obs.y + 25);

        // Comprobar si el tigre chocó
        if (checkCollision(tiger, obs)) {
            gameActive = false;
            gameOverEl.classList.remove('hidden');
        }

        // Si esquiva el obstáculo con éxito
        if (obs.x < -50) {
            obstacles.splice(index, 1);
            score += 10;
            scoreEl.innerText = `Puntos: ${score}`;
        }
    });

    requestAnimationFrame(animate);
}

// Controles (Teclado, Pantalla táctil y Botón dedicado)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameActive) tiger.jump();
        else resetGame();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameActive) tiger.jump();
    else resetGame();
});

jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameActive) tiger.jump();
});

gameOverEl.addEventListener('click', () => {
    if (!gameActive) resetGame();
});

// Registro del Service Worker para la PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA: Service Worker activo.', reg.scope))
            .catch(err => console.error('PWA: Error al registrar SW.', err));
    });
}

// Iniciar juego por primera vez
animate();
