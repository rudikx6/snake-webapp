const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const restartBtn = document.getElementById('restartBtn');

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
    // ensure not on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function checkCollision() {
    const head = snake[0];
    // wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    // self collision
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

function changeDirection(e) {
    const key = e.key;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    
    if ((key === 'ArrowLeft' || key === 'a') && !goingRight) { dx = -1; dy = 0; }
    if ((key === 'ArrowUp' || key === 'w') && !goingDown) { dx = 0; dy = -1; }
    if ((key === 'ArrowRight' || key === 'd') && !goingLeft) { dx = 1; dy = 0; }
    if ((key === 'ArrowDown' || key === 's') && !goingUp) { dx = 0; dy = 1; }
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

document.addEventListener('keydown', changeDirection);
restartBtn.addEventListener('click', startGame);

startGame();