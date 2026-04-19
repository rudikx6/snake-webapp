const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const restartBtn = document.getElementById('restartBtn');
const touchControls = document.getElementById('touchControls');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop = null;

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
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreValue.textContent = score;
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
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
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
        restartBtn.style.display = 'inline-block';
    }
}

function setDirection(newDx, newDy) {
    // prevent 180-degree turn
    if (dx === -newDx && dy === -newDy) return;
    dx = newDx;
    dy = newDy;
}

function handleDirectionFromButton(dir) {
    switch(dir) {
        case 'up':    setDirection(0, -1); break;
        case 'down':  setDirection(0, 1); break;
        case 'left':  setDirection(-1, 0); break;
        case 'right': setDirection(1, 0); break;
    }
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
    if (key === 'ArrowLeft' || key === 'a') handleDirectionFromButton('left');
    if (key === 'ArrowUp' || key === 'w')   handleDirectionFromButton('up');
    if (key === 'ArrowRight' || key === 'd')handleDirectionFromButton('right');
    if (key === 'ArrowDown' || key === 's') handleDirectionFromButton('down');
});

// Touch controls via buttons
if (touchControls) {
    const buttons = touchControls.querySelectorAll('.controlBtn');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', e => {
            e.preventDefault(); // prevent ghost click
            const dir = btn.getAttribute('data-dir');
            handleDirectionFromButton(dir);
        }, {passive: false});
        btn.addEventListener('click', e => {
            e.preventDefault();
            const dir = btn.getAttribute('data-dir');
            handleDirectionFromButton(dir);
        });
    });
}

// Prevent page scrolling on touch gestures
document.addEventListener('touchmove', e => e.preventDefault(), {passive: false});
// Also prevent zoom double-tap
document.addEventListener('gesturestart', e => e.preventDefault());

restartBtn.addEventListener('click', startGame);

startGame();