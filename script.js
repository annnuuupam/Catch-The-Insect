const screens = document.querySelectorAll(".screen");
const chooseInsectButtons = document.querySelectorAll(".choose-insect-btn");
const startButton = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const message = document.getElementById("message");
const rulesModal = document.getElementById("rules-modal");
const rulesBtn = document.getElementById("rules-btn");
const closeRulesBtn = document.getElementById("close-rules-btn");
const finalScoreElement = document.getElementById("final-score");
const restartButton = document.getElementById("restart-btn");

let secondsLeft = 60;
let score = 0;
let highScore = localStorage.getItem("insectHighScore") || 0;
let selectedInsect = {};
let gameInterval;
let gameActive = false;
let isPaused = false;

// Create a pause overlay message
let pauseMessageElement = document.createElement('h2');
pauseMessageElement.style.position = 'absolute';
pauseMessageElement.style.top = '50%';
pauseMessageElement.style.left = '50%';
pauseMessageElement.style.transform = 'translate(-50%, -50%)';
pauseMessageElement.style.color = '#fff';
pauseMessageElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
pauseMessageElement.style.padding = '20px';
pauseMessageElement.style.borderRadius = '10px';
pauseMessageElement.style.display = 'none';
pauseMessageElement.style.zIndex = '1000';
pauseMessageElement.innerText = 'PAUSED';
gameContainer.appendChild(pauseMessageElement);

window.addEventListener('keydown', (e) => {
  if((e.key === ' ' || e.key === 'p' || e.key === 'P') && gameActive) {
    isPaused = !isPaused;
    if(isPaused) {
      clearInterval(gameInterval);
      pauseMessageElement.style.display = 'block';
    } else {
      gameInterval = setInterval(decreaseTime, 1000);
      pauseMessageElement.style.display = 'none';
      // Continue adding insects 
      addInsects();
    }
  }
});

highScoreElement.innerHTML = `Best: ${highScore}`;

startButton.addEventListener("click", () => screens[0].classList.add("up"));
rulesBtn.addEventListener("click", () => rulesModal.classList.add("visible"));
closeRulesBtn.addEventListener("click", () => rulesModal.classList.remove("visible"));

chooseInsectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    const src = image.getAttribute("src");
    const alt = image.getAttribute("alt");
    selectedInsect = { src, alt };
    screens[1].classList.add("up");
    setTimeout(createInsect, 1000);
    startGame();
  });
});

const startGame = () => {
  score = 0;
  secondsLeft = 60;
  gameActive = true;
  scoreElement.innerHTML = `Score: ${score}`;
  timeElement.innerHTML = `Time: 60`;
  message.classList.remove("visible");
  
  // Clear any existing bugs
  gameContainer.querySelectorAll('.insect').forEach(i => i.remove());
  
  clearInterval(gameInterval);
  gameInterval = setInterval(decreaseTime, 1000);
};

const decreaseTime = () => {
  if (!gameActive || isPaused) return;
  
  secondsLeft--;
  let s = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;
  timeElement.innerHTML = `Time: ${s}`;
  
  if (secondsLeft <= 0) {
    gameOver();
  }
};

const gameOver = () => {
  gameActive = false;
  clearInterval(gameInterval);
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("insectHighScore", highScore);
    highScoreElement.innerHTML = `Best: ${highScore}`;
  }
  
  finalScoreElement.innerText = score;
  message.classList.add("visible");
  
  // Remove remaining bugs so they don't block the UI
  setTimeout(() => {
    gameContainer.querySelectorAll('.insect').forEach(i => i.remove());
  }, 500);
};

restartButton.addEventListener("click", () => {
  startGame();
  setTimeout(createInsect, 500);
});

const updateLevelVisuals = () => {
  let currentLevel = 1;
  if (score > 40) currentLevel = 4;
  else if (score > 20) currentLevel = 3;
  else if (score > 10) currentLevel = 2;
  
  // Create a level indicator if it doesn't exist
  let levelElement = document.getElementById('level-indicator');
  if(!levelElement) {
    levelElement = document.createElement('h3');
    levelElement.id = 'level-indicator';
    levelElement.style.position = 'absolute';
    levelElement.style.top = '20px';
    levelElement.style.left = '50%';
    levelElement.style.transform = 'translateX(-50%)';
    levelElement.style.margin = '0';
    levelElement.style.fontSize = '16px';
    levelElement.style.color = '#ffd700';
    gameContainer.appendChild(levelElement);
  }
  levelElement.innerHTML = `Level: ${currentLevel}`;
};

const increaseScore = (points = 1) => {
  score += points;
  scoreElement.innerHTML = `Score: ${score}`;
  updateLevelVisuals();
};

const addInsects = () => {
  if (!gameActive || isPaused) return;
  setTimeout(createInsect, 1000);
  setTimeout(createInsect, 1500);
};

const catchInsect = function () {
  if (!gameActive || isPaused) return;
  
  const isGolden = this.classList.contains('golden');
  increaseScore(isGolden ? 5 : 1);
  this.classList.add("caught");
  
  if (isGolden) {
    this.style.filter = "brightness(5) saturate(0) sepia(1) hue-rotate(50deg)";
  }
  
  // FIXED BUG: added parentheses to this.remove()
  setTimeout(() => this.remove(), 2000);
  addInsects();
};

const getRandomLocation = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const x = Math.random() * (width - 200) + 100;
  const y = Math.random() * (height - 200) + 100;
  return { x, y };
};

const createInsect = () => {
  if (!gameActive || isPaused) return;
  
  const insect = document.createElement("div");
  insect.classList.add("insect");
  
  // 10% chance for a golden bug
  const isGolden = Math.random() > 0.9; 
  if(isGolden) insect.classList.add("golden");
  
  const { x, y } = getRandomLocation();
  insect.style.top = `${y}px`;
  insect.style.left = `${x}px`;
  
  let insectSize = 100;
  if(score > 40) insectSize = 40;
  else if(score > 20) insectSize = 60;
  else if(score > 10) insectSize = 80;

  const imgSrc = selectedInsect.src;
  const imgAlt = isGolden ? `golden ${selectedInsect.alt}` : selectedInsect.alt;
  const goldenStyle = isGolden ? `filter: brightness(2) drop-shadow(0 0 10px gold) sepia(1) hue-rotate(30deg);` : '';
  
  insect.innerHTML = `<img src="${imgSrc}" alt="${imgAlt}" style="transform: rotate(${Math.random() * 360}deg); width: ${insectSize}px; height: ${insectSize}px; ${goldenStyle}" />`;
  
  insect.addEventListener("click", catchInsect);
  gameContainer.appendChild(insect);
};
