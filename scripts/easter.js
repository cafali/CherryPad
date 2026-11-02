document.addEventListener('DOMContentLoaded', function() {
  const scoreElement = document.getElementById('counter');
  const livesElement = document.getElementById('lives');
  const basket = document.getElementById('basket');
  const feedback = document.getElementById('gameFeedback');
  const gameOver = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  const restartButton = document.getElementById('restartButton');
  const exitGameButton = document.getElementById('exitGameButton');
  const items = new Set();
  const keysDown = new Set();
  let score = 0;
  let lives = 3;
  let basketX = window.innerWidth / 2;
  let lastFrameTime = 0;
  let spawnTimer;
  let animationFrame;
  let feedbackTimer;
  let isGameOver = false;

  function updateScore() {
    scoreElement.textContent = `SCORE: ${score}`;
  }

  function updateLives() {
    while (livesElement.children.length < Math.max(3, lives)) {
      const heart = document.createElement('span');
      heart.textContent = '❤️';
      livesElement.appendChild(heart);
    }
    Array.from(livesElement.children).forEach((heart, index) => {
      heart.classList.toggle('lost', index >= lives);
    });
    livesElement.setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'} remaining`);
  }

  function showFeedback(message, basketEffect) {
    feedback.textContent = message;
    feedback.classList.add('visible');
    basket.classList.remove('caught-bug', 'caught-bomb', 'caught-heart');
    if (basketEffect) basket.classList.add(basketEffect);
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedback.classList.remove('visible');
      basket.classList.remove('caught-bug', 'caught-bomb', 'caught-heart');
    }, 650);
  }

  function removeItem(item) {
    item.element.remove();
    items.delete(item);
  }

  function finishGame() {
    isGameOver = true;
    clearInterval(spawnTimer);
    cancelAnimationFrame(animationFrame);
    items.forEach(removeItem);
    finalScore.textContent = `FINAL SCORE: ${score}`;
    if (document.pointerLockElement) document.exitPointerLock();
    gameOver.hidden = false;
    restartButton.focus();
  }

  function loseLife(message, effect) {
    lives = Math.max(0, lives - 1);
    updateLives();
    showFeedback(message, effect);
    if (effect === 'caught-bomb') {
      document.body.classList.remove('bomb-hit');
      void document.body.offsetWidth;
      document.body.classList.add('bomb-hit');
    }
    if (lives === 0) finishGame();
  }

  function catchItem(item) {
    if (item.type === 'cherry') {
      score += 1;
      updateScore();
      showFeedback('+1 🍒');
      if (score % 10 === 0) spawnItem('heart');
    } else if (item.type === 'bug') {
      loseLife('🐛 BUG! -1 LIFE', 'caught-bug');
    } else if (item.type === 'bomb') {
      loseLife('💥 BOOM! -1 LIFE', 'caught-bomb');
    } else {
      lives += 1;
      updateLives();
      showFeedback('+1 ❤️', 'caught-heart');
    }
  }

  function spawnItem(forcedType) {
    if (isGameOver) return;

    const roll = Math.random();
    const type = forcedType || (roll < 0.65 ? 'cherry' : roll < 0.85 ? 'bug' : 'bomb');
    const emoji = type === 'cherry' ? '🍒' : type === 'bug' ? '🐛' : type === 'bomb' ? '💣' : '❤️';
    const element = document.createElement('span');
    element.className = `falling-item ${type}`;
    element.textContent = emoji;
    element.setAttribute('aria-hidden', 'true');
    element.style.fontSize = `${Math.round(34 + Math.random() * 18)}px`;
    document.body.appendChild(element);

    items.add({
      element,
      type,
      x: Math.random() * Math.max(0, window.innerWidth - 54),
      y: -64,
      speed: 150 + Math.random() * 70 + Math.min(score * 3, 90)
    });
  }

  function setBasketPosition(x) {
    const halfWidth = basket.offsetWidth / 2;
    basketX = Math.max(halfWidth, Math.min(window.innerWidth - halfWidth, x));
    basket.style.left = `${basketX}px`;
  }

  function gameLoop(timestamp) {
    if (isGameOver) return;
    const deltaTime = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.05) : 0;
    lastFrameTime = timestamp;

    if (keysDown.has('ArrowLeft') || keysDown.has('a')) {
      setBasketPosition(basketX - 380 * deltaTime);
    }
    if (keysDown.has('ArrowRight') || keysDown.has('d')) {
      setBasketPosition(basketX + 380 * deltaTime);
    }

    const basketRect = basket.getBoundingClientRect();
    items.forEach((item) => {
      item.y += item.speed * deltaTime;
      item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      const itemRect = item.element.getBoundingClientRect();
      const overlapsBasket = itemRect.bottom >= basketRect.top
        && itemRect.top <= basketRect.bottom
        && itemRect.right >= basketRect.left
        && itemRect.left <= basketRect.right;

      if (overlapsBasket) {
        removeItem(item);
        catchItem(item);
      } else if (item.y > window.innerHeight) {
        removeItem(item);
        if (item.type === 'cherry') loseLife('🍒 MISSED! -1 LIFE');
      }
    });

    animationFrame = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    isGameOver = false;
    score = 0;
    lives = 3;
    lastFrameTime = 0;
    updateScore();
    updateLives();
    setBasketPosition(window.innerWidth / 2);
    feedback.classList.remove('visible');
    document.body.classList.remove('bomb-hit');
    gameOver.hidden = true;
    spawnTimer = setInterval(spawnItem, 800);
    animationFrame = requestAnimationFrame(gameLoop);
  }

  document.addEventListener('pointermove', (event) => {
    if (document.pointerLockElement === document.body) {
      setBasketPosition(basketX + event.movementX);
    } else {
      setBasketPosition(event.clientX);
    }
  });
  document.addEventListener('click', () => {
    if (!isGameOver && document.pointerLockElement !== document.body) {
      const lockRequest = document.body.requestPointerLock();
      if (lockRequest && typeof lockRequest.catch === 'function') {
        lockRequest.catch((error) => console.error('Could not capture the game pointer:', error));
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
    keysDown.add(event.key);
  });
  document.addEventListener('keyup', (event) => keysDown.delete(event.key));
  window.addEventListener('blur', () => keysDown.clear());
  window.addEventListener('resize', () => setBasketPosition(basketX));
  restartButton.addEventListener('click', startGame);
  exitGameButton.addEventListener('click', () => {
    window.location.assign('cherrypad.html');
  });

  startGame();
});

// go back to fullscreen mode - ESC
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
      window.location.href = "cherrypad.html";
  }
});