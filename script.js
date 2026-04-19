const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const restartBtn = document.getElementById('restartBtn');
const joystickContainer = document.getElementById('joystickContainer');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop = null;

// Audio setup
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}
function playTone(frequency, duration, type = 'sine') {
    initAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}
function playEatSound() {
    playTone(440, 0.1, 'sine');
}
function playGameOverSound() {
    playTone(220, 0.3, 'triangle');
}

function clearCanvas() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#0f0';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Wrap around walls
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreValue.textContent = score;
        playEatSound();
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function checkCollision() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function gameLoopFn() {
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
    if (checkCollision()) {
        clearInterval(gameLoop);
        playGameOverSound();
        restartBtn.style.display = 'inline-block';
    }
}

function setDirection(newDx, newDy) {
    if (dx === -newDx && dy === -newDy) return;
    dx = newDx;
    dy = newDy;
}

function startGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 5, y: 5};
    dx = 0; dy = 0;
    score = 0;
    scoreValue.textContent = score;
    restartBtn.style.display = 'none';
    clearInterval(gameLoop);
    gameLoop = setInterval(gameLoopFn, 100);
}

// Keyboard controls
document.addEventListener('keydown', e => {
    const key = e.key;
    if (key === 'ArrowLeft' || key === 'a') setDirection(-1, 0);
    if (key === 'ArrowUp' || key === 'w')   setDirection(0, -1);
    if (key === 'ArrowRight' || key === 'd')setDirection(1, 0);
    if (key === 'ArrowDown' || key === 's') setDirection(0, 1);
});

// Joystick via nipplejs
const joystick = nipplejs.create({
    zone: joystickContainer,
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: '#fff',
    threshold: 0.1,
    size: 100
});

joystick.on('dir:up',    evt => setDirection(0, -1));
joystick.on('dir:down',  evt => setDirection(0, 1));
joystick.on('dir:left',  evt => setDirection(-1, 0));
joystick.on('dir:right', evt => setDirection(1, 0));
// optional: on 'end' stop? we keep last direction until new input.

// Prevent page scrolling on touch gestures
document.addEventListener('touchmove', e => e.preventDefault(), {passive: false});
document.addEventListener('gesturestart', e => e.preventDefault());

restartBtn.addEventListener('click', startGame);

startGame();