const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Imposta dimensioni del canvas e gridSize basandosi sulla larghezza della finestra
let gridSize;
if (window.innerWidth < 576) {
  canvas.width = window.innerWidth * 0.9; // Aggiungiamo un margine del 10%
  canvas.height = window.innerWidth * 0.9; // Manteniamo un canvas quadrato
  gridSize = canvas.width / 8; // Dimensione della griglia per dispositivi mobili (8x8)
} else {
  canvas.width = window.innerWidth * 0.9; // Aggiungiamo un margine del 10%
  canvas.height = window.innerWidth * 0.9; // Manteniamo un canvas quadrato
  gridSize = canvas.width / 8; // Dimensione della griglia per dispositivi mobili (8x8)
}

const snake = [{ x: 2, y: 2 }];
let direction = { x: 0, y: 0 };
let food = generateFood();
let lastUpdate = 0;
const updateInterval = 400;
let gameOver = false;
let gameWon = false;

let imagesLoaded = 0;
let foodDrawn = false;
let logsPrinted = false;

const backgroundImage = new Image();
backgroundImage.src = "images/cell_gamesarena.jpg";
backgroundImage.onload = () => imagesLoaded++;

const playerImage = new Image();
playerImage.src = "images/morgan_200x200.jpg";
playerImage.onload = () => imagesLoaded++;

const foodImage = new Image();
foodImage.src = "images/bugo_2_100x100.jpg";
foodImage.onload = () => imagesLoaded++;
foodImage.onerror = function () {
  console.error("Errore nel caricamento dell'immagine del cibo");
};

function allImagesLoaded() {
  return imagesLoaded === 3;
}

function drawGrid() {
  ctx.strokeStyle = "red";
  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.strokeRect(x, y, gridSize, gridSize);
    }
  }
}

function draw() {
  if (!allImagesLoaded()) {
    requestAnimationFrame(draw);
    return;
  }

  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawGrid();

  for (let i = 0; i < snake.length; i++) {
    ctx.drawImage(
      playerImage,
      snake[i].x * gridSize,
      snake[i].y * gridSize,
      gridSize,
      gridSize
    );
  }

  if (foodImage.complete) {
    ctx.drawImage(
      foodImage,
      food.x * gridSize,
      food.y * gridSize,
      gridSize,
      gridSize
    );
    if (!logsPrinted) {
      console.log(
        `Cibo disegnato a (${food.x}, ${food.y}) sulla griglia (${
          food.x * gridSize
        }, ${food.y * gridSize})`
      );
      logsPrinted = true;
    }
  } else {
    console.error("L'immagine del cibo non è ancora caricata.");
  }

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    ctx.font = "24px Arial";
    ctx.fillText(
      "Fai clic per ricominciare",
      canvas.width / 2,
      canvas.height / 2 + 50
    );
  }

  if (gameWon) {
    const winText = document.getElementById("winText");
    winText.style.display = "block";
    ctx.fillStyle = "green";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Fai clic per ricominciare",
      canvas.width / 2,
      canvas.height / 2 + 100
    );
  }
}

function generateFood() {
  let newFood;
  let isOnSnake;

  do {
    isOnSnake = false;
    newFood = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)),
      y: Math.floor(Math.random() * (canvas.height / gridSize)),
    };

    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
        isOnSnake = true;
        break;
      }
    }
  } while (isOnSnake);

  return newFood;
}

function update(currentTime) {
  if (currentTime - lastUpdate < updateInterval || gameOver || gameWon) {
    requestAnimationFrame(update);
    return;
  }
  lastUpdate = currentTime;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  head.x = (head.x + canvas.width / gridSize) % (canvas.width / gridSize);
  head.y = (head.y + canvas.height / gridSize) % (canvas.height / gridSize);

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOver = true;
      return;
    }
  }

  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    foodDrawn = false;
    logsPrinted = false;
    console.log("Serpente ha mangiato il cibo!");
  } else {
    snake.pop();
  }

  snake.unshift(head);

  if (!logsPrinted) {
    console.log(`Testa del serpente a (${head.x}, ${head.y})`);
    logsPrinted = true;
  }

  if (snake.length >= 15) {
    gameWon = true;
    const winText = document.getElementById("winText");
    winText.style.display = "block";
  }
}

function resetGame() {
  snake.length = 0;
  snake.push({ x: 2, y: 2 });
  direction = { x: 0, y: 0 };
  food = generateFood();
  foodDrawn = false;
  logsPrinted = false;
  gameOver = false;
  gameWon = false;
  const winText = document.getElementById("winText");
  winText.style.display = "none";
  gameLoop();
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT = 37;
  const UP = 38;
  const RIGHT = 39;
  const DOWN = 40;
  const ENTER = 13;
  const goingUp = direction.y === -1;
  const goingDown = direction.y === 1;
  const goingRight = direction.x === 1;
  const goingLeft = direction.x === -1;

  if (keyPressed === LEFT && !goingRight) {
    direction = { x: -1, y: 0 };
  } else if (keyPressed === RIGHT && !goingLeft) {
    direction = { x: 1, y: 0 };
  } else if (keyPressed === UP && !goingDown) {
    direction = { x: 0, y: -1 };
  } else if (keyPressed === DOWN && !goingUp) {
    direction = { x: 0, y: 1 };
  } else if (keyPressed === ENTER && (gameOver || gameWon)) {
    resetGame();
  }
}

// Aggiungi supporto per i controlli touch
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
  const firstTouch = evt.touches[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  const xUp = evt.touches[0].clientX;
  const yUp = evt.touches[0].clientY;

  const xDiff = xDown - xUp;
  const yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0 && direction.x !== 1) {
      direction = { x: -1, y: 0 };
    } else if (xDiff < 0 && direction.x !== -1) {
      direction = { x: 1, y: 0 };
    }
  } else {
    if (yDiff > 0 && direction.y !== 1) {
      direction = { x: 0, y: -1 };
    } else if (yDiff < 0 && direction.y !== -1) {
      direction = { x: 0, y: 1 };
    }
  }

  xDown = null;
  yDown = null;
}

function handleClick() {
  if (gameOver || gameWon) {
    resetGame();
  }
}

function gameLoop() {
  update(performance.now());
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", handleClick);
document.addEventListener("keydown", changeDirection);
canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);

gameLoop();
