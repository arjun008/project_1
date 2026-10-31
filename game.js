/**
 * Classic T-Rex Dino Runner Game
 * Built with HTML5 Canvas & Web Audio API
 */

(function () {
  'use strict';

  // --- Audio System (Synthesized with Web Audio API) ---
  class SoundEffects {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playJump() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }

    playScore() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.2, now + 0.14);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }

    playHit() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {}
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  }

  // --- Constants & Config ---
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 260;
  const GROUND_Y = 220;
  const GRAVITY = 0.65;
  const INITIAL_SPEED = 6.5;
  const MAX_SPEED = 14;
  const ACCELERATION = 0.0015;

  // --- DOM Elements ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const startOverlay = document.getElementById('start-overlay');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const currentScoreEl = document.getElementById('current-score');
  const highScoreEl = document.getElementById('high-score');
  const gameOverScoreEl = document.getElementById('game-over-score');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const soundBtn = document.getElementById('sound-btn');
  const touchJumpBtn = document.getElementById('touch-jump');
  const touchDuckBtn = document.getElementById('touch-duck');

  const sound = new SoundEffects();

  // --- Game State ---
  let gameState = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
  let score = 0;
  let highScore = parseInt(localStorage.getItem('dino_runner_hi') || '0', 10);
  let speed = INITIAL_SPEED;
  let distanceRan = 0;
  let lastMilestone = 0;
  let isNight = false;
  let nightTransition = 0;

  highScoreEl.textContent = String(highScore).padStart(5, '0');

  // Input states
  const keys = {
    jump: false,
    duck: false
  };

  // --- Dino Player ---
  const dino = {
    x: 50,
    y: GROUND_Y - 47,
    vy: 0,
    width: 44,
    height: 47,
    isJumping: false,
    isDucking: false,
    isDead: false,
    legFrame: 0,
    animTimer: 0,

    reset() {
      this.x = 50;
      this.y = GROUND_Y - 47;
      this.vy = 0;
      this.width = 44;
      this.height = 47;
      this.isJumping = false;
      this.isDucking = false;
      this.isDead = false;
      this.legFrame = 0;
      this.animTimer = 0;
    },

    jump() {
      if (!this.isJumping && !this.isDead) {
        this.vy = -12.5;
        this.isJumping = true;
        sound.playJump();
      }
    },

    update(delta) {
      if (this.isDead) return;

      // Ducking logic
      if (keys.duck && !this.isJumping) {
        this.isDucking = true;
        this.width = 58;
        this.height = 30;
        this.y = GROUND_Y - 30;
      } else {
        if (this.isDucking) {
          this.isDucking = false;
          this.width = 44;
          this.height = 47;
          this.y = GROUND_Y - 47;
        }
      }

      // Physics
      if (this.isJumping) {
        this.y += this.vy;
        this.vy += GRAVITY;

        // Ground collision
        const baseHeight = this.isDucking ? 30 : 47;
        if (this.y >= GROUND_Y - baseHeight) {
          this.y = GROUND_Y - baseHeight;
          this.vy = 0;
          this.isJumping = false;
        }
      }

      // Leg animation timer
      this.animTimer += delta;
      if (this.animTimer > 0.09) {
        this.legFrame = (this.legFrame + 1) % 2;
        this.animTimer = 0;
      }
    },

    draw(c, color) {
      c.save();
      c.fillStyle = color;

      const px = Math.round(this.x);
      const py = Math.round(this.y);

      if (this.isDucking) {
        // --- Ducking Sprite ---
        // Body & Tail
        c.fillRect(px, py + 14, 18, 10);
        c.fillRect(px + 10, py + 6, 26, 18);
        c.fillRect(px + 30, py + 8, 22, 14);
        c.fillRect(px + 46, py + 12, 10, 8); // Snout
        c.fillRect(px + 42, py + 18, 12, 4);  // Jaw

        // Eye
        c.fillStyle = isNight ? '#171717' : '#fafafa';
        c.fillRect(px + 36, py + 10, 3, 3);
        c.fillStyle = color;

        // Legs while ducking
        if (this.legFrame === 0) {
          c.fillRect(px + 18, py + 24, 4, 6);
          c.fillRect(px + 32, py + 24, 4, 4);
        } else {
          c.fillRect(px + 18, py + 24, 4, 4);
          c.fillRect(px + 32, py + 24, 4, 6);
        }
      } else {
        // --- Standing / Running Sprite ---
        // Head
        c.fillRect(px + 22, py, 20, 16);
        c.fillRect(px + 24, py + 16, 18, 4);
        c.fillRect(px + 36, py + 4, 6, 8); // snout edge

        // Eye
        c.fillStyle = isNight ? '#171717' : '#fafafa';
        if (this.isDead) {
          // X Eye
          c.fillRect(px + 28, py + 4, 4, 4);
        } else {
          c.fillRect(px + 28, py + 4, 3, 3);
        }
        c.fillStyle = color;

        // Body & Arms
        c.fillRect(px + 12, py + 16, 14, 18);
        c.fillRect(px + 6, py + 20, 8, 12); // Tail curve
        c.fillRect(px, py + 22, 8, 8);      // Tail tip
        c.fillRect(px + 24, py + 22, 6, 4);  // Arm

        // Legs
        if (this.isJumping) {
          // Fixed legs mid-air
          c.fillRect(px + 12, py + 34, 4, 10);
          c.fillRect(px + 12, py + 44, 6, 3);
          c.fillRect(px + 20, py + 34, 4, 8);
        } else if (this.isDead) {
          c.fillRect(px + 12, py + 34, 4, 13);
          c.fillRect(px + 12, py + 44, 7, 3);
          c.fillRect(px + 20, py + 34, 4, 13);
          c.fillRect(px + 20, py + 44, 7, 3);
        } else {
          // Alternating run frames
          if (this.legFrame === 0) {
            c.fillRect(px + 12, py + 34, 4, 13);
            c.fillRect(px + 12, py + 44, 7, 3);
            c.fillRect(px + 20, py + 34, 4, 8);
          } else {
            c.fillRect(px + 12, py + 34, 4, 8);
            c.fillRect(px + 20, py + 34, 4, 13);
            c.fillRect(px + 20, py + 44, 7, 3);
          }
        }
      }

      c.restore();
    },

    getHitbox() {
      // Slightly inset hitbox for forgiving, satisfying gameplay
      const insetX = 6;
      const insetY = 4;
      return {
        x: this.x + insetX,
        y: this.y + insetY,
        width: this.width - (insetX * 2),
        height: this.height - (insetY * 2)
      };
    }
  };

  // --- Environment Objects ---
  class Cloud {
    constructor(x) {
      this.x = x || CANVAS_WIDTH + Math.random() * 200;
      this.y = 30 + Math.random() * 60;
      this.speed = 1.2 + Math.random() * 0.8;
      this.width = 54;
      this.height = 18;
    }

    update() {
      this.x -= this.speed;
      if (this.x < -this.width) {
        this.x = CANVAS_WIDTH + Math.random() * 100;
        this.y = 30 + Math.random() * 60;
      }
    }

    draw(c, color) {
      c.save();
      c.fillStyle = color;
      const x = Math.round(this.x);
      const y = Math.round(this.y);
      // Pixel cloud
      c.fillRect(x + 14, y, 26, 6);
      c.fillRect(x + 8, y + 6, 38, 6);
      c.fillRect(x, y + 12, 54, 6);
      c.restore();
    }
  }

  class Ground {
    constructor() {
      this.offsetX = 0;
      this.bumps = [];
      this.generateBumps();
    }

    generateBumps() {
      this.bumps = [];
      for (let i = 0; i < 60; i++) {
        this.bumps.push({
          x: i * 20 + Math.random() * 10,
          y: GROUND_Y + 4 + Math.random() * 18,
          w: 2 + Math.floor(Math.random() * 4),
          h: 2
        });
      }
    }

    update(spd) {
      this.offsetX += spd;
      for (let b of this.bumps) {
        b.x -= spd;
        if (b.x < -10) {
          b.x += 1200;
          b.y = GROUND_Y + 4 + Math.random() * 18;
        }
      }
    }

    draw(c, color) {
      c.save();
      c.fillStyle = color;
      // Horizon line
      c.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

      // Gravel bumps
      for (let b of this.bumps) {
        if (b.x >= 0 && b.x <= CANVAS_WIDTH) {
          c.fillRect(Math.round(b.x), Math.round(b.y), b.w, b.h);
        }
      }
      c.restore();
    }
  }

  // --- Obstacle Classes ---
  class Cactus {
    constructor(type, x) {
      this.type = type; // 'small', 'double_small', 'large', 'triple'
      this.x = x;
      this.y = GROUND_Y;
      this.scored = false;

      switch (type) {
        case 'small':
          this.width = 16;
          this.height = 36;
          break;
        case 'double_small':
          this.width = 34;
          this.height = 36;
          break;
        case 'large':
          this.width = 24;
          this.height = 50;
          break;
        case 'triple':
          this.width = 56;
          this.height = 50;
          break;
      }
      this.y = GROUND_Y - this.height;
    }

    update(spd) {
      this.x -= spd;
    }

    draw(c, color) {
      c.save();
      c.fillStyle = color;
      const x = Math.round(this.x);
      const y = Math.round(this.y);

      if (this.type === 'small') {
        this.drawSingleSmall(c, x, y);
      } else if (this.type === 'double_small') {
        this.drawSingleSmall(c, x, y);
        this.drawSingleSmall(c, x + 18, y + 2);
      } else if (this.type === 'large') {
        this.drawSingleLarge(c, x, y);
      } else if (this.type === 'triple') {
        this.drawSingleLarge(c, x, y);
        this.drawSingleLarge(c, x + 18, y + 3);
        this.drawSingleLarge(c, x + 36, y);
      }
      c.restore();
    }

    drawSingleSmall(c, x, y) {
      // Stem
      c.fillRect(x + 5, y, 6, 36);
      // Left arm
      c.fillRect(x, y + 8, 4, 14);
      c.fillRect(x + 2, y + 18, 4, 4);
      // Right arm
      c.fillRect(x + 12, y + 12, 4, 12);
      c.fillRect(x + 10, y + 20, 4, 4);
    }

    drawSingleLarge(c, x, y) {
      // Main trunk
      c.fillRect(x + 8, y, 8, 50);
      // Left arm
      c.fillRect(x, y + 12, 6, 20);
      c.fillRect(x + 4, y + 26, 6, 6);
      // Right arm
      c.fillRect(x + 18, y + 16, 6, 18);
      c.fillRect(x + 14, y + 28, 6, 6);
    }

    getHitbox() {
      return {
        x: this.x + 3,
        y: this.y + 2,
        width: this.width - 6,
        height: this.height - 4
      };
    }
  }

  class Pterodactyl {
    constructor(x, altitude) {
      this.x = x;
      this.altitude = altitude; // 'high' (can stand), 'mid' (must duck), 'low' (must jump)
      this.width = 46;
      this.height = 30;
      this.animTimer = 0;
      this.wingFrame = 0;

      if (altitude === 'high') {
        this.y = GROUND_Y - 74; // Dino can run underneath
      } else if (altitude === 'mid') {
        this.y = GROUND_Y - 48; // Must duck under!
      } else {
        this.y = GROUND_Y - 30; // Close to ground, must jump
      }
    }

    update(spd, delta) {
      this.x -= spd * 1.08; // slightly faster than ground speed
      this.animTimer += delta;
      if (this.animTimer > 0.14) {
        this.wingFrame = (this.wingFrame + 1) % 2;
        this.animTimer = 0;
      }
    }

    draw(c, color) {
      c.save();
      c.fillStyle = color;
      const x = Math.round(this.x);
      const y = Math.round(this.y);

      // Body & Head
      c.fillRect(x + 14, y + 10, 18, 8); // body
      c.fillRect(x + 30, y + 6, 14, 6);  // neck/beak
      c.fillRect(x + 36, y + 12, 10, 4); // beak tip

      // Eye
      c.fillStyle = isNight ? '#171717' : '#fafafa';
      c.fillRect(x + 34, y + 6, 2, 2);
      c.fillStyle = color;

      // Wings
      if (this.wingFrame === 0) {
        // Wings Up
        c.fillRect(x + 18, y, 8, 10);
        c.fillRect(x + 22, y - 6, 6, 8);
      } else {
        // Wings Down
        c.fillRect(x + 18, y + 16, 8, 10);
        c.fillRect(x + 20, y + 24, 6, 6);
      }

      // Tail
      c.fillRect(x + 4, y + 12, 10, 4);

      c.restore();
    }

    getHitbox() {
      return {
        x: this.x + 6,
        y: this.y + 6,
        width: this.width - 12,
        height: this.height - 10
      };
    }
  }

  // --- Manager Collections ---
  const clouds = [
    new Cloud(100),
    new Cloud(350),
    new Cloud(600)
  ];
  const ground = new Ground();
  let obstacles = [];
  let obstacleTimer = 0;
  let minObstacleDistance = 280;

  // --- Helper Functions ---
  function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  function spawnObstacle() {
    const minDistance = Math.max(180, 400 - speed * 15);
    const lastObstacle = obstacles[obstacles.length - 1];
    if (lastObstacle && (CANVAS_WIDTH - lastObstacle.x < minDistance)) {
      return;
    }

    // Determine type
    const rand = Math.random();
    let newObs;

    // Introduce flying pterodactyls once score exceeds 150
    if (score > 150 && Math.random() < 0.32) {
      const altitudes = ['mid', 'low', 'high'];
      const alt = altitudes[Math.floor(Math.random() * altitudes.length)];
      newObs = new Pterodactyl(CANVAS_WIDTH + 20, alt);
    } else {
      let type = 'small';
      if (rand < 0.35) type = 'small';
      else if (rand < 0.6) type = 'double_small';
      else if (rand < 0.85) type = 'large';
      else type = 'triple';

      newObs = new Cactus(type, CANVAS_WIDTH + 20);
    }

    obstacles.push(newObs);
  }

  function updateScore() {
    score = Math.floor(distanceRan / 10);
    currentScoreEl.textContent = String(score).padStart(5, '0');

    // Score Milestone chime every 100 points
    if (score > 0 && score % 100 === 0 && score !== lastMilestone) {
      lastMilestone = score;
      sound.playScore();

      // Flash score effect
      currentScoreEl.style.opacity = '0.3';
      setTimeout(() => { currentScoreEl.style.opacity = '1'; }, 100);
      setTimeout(() => { currentScoreEl.style.opacity = '0.3'; }, 200);
      setTimeout(() => { currentScoreEl.style.opacity = '1'; }, 300);
    }

    // Night Mode shift every 700 points
    const cycle = Math.floor(score / 700);
    const shouldBeNight = cycle % 2 === 1;
    if (shouldBeNight !== isNight) {
      isNight = shouldBeNight;
      document.body.classList.toggle('night-mode', isNight);
    }
  }

  function resetGame() {
    dino.reset();
    obstacles = [];
    score = 0;
    distanceRan = 0;
    lastMilestone = 0;
    speed = INITIAL_SPEED;
    isNight = false;
    document.body.classList.remove('night-mode');
    currentScoreEl.textContent = '00000';
  }

  function gameOver() {
    gameState = 'GAMEOVER';
    dino.isDead = true;
    sound.playHit();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('dino_runner_hi', highScore);
      highScoreEl.textContent = String(highScore).padStart(5, '0');
    }

    gameOverScoreEl.textContent = `Score: ${score}`;
    gameOverOverlay.classList.remove('hidden');
  }

  // --- Main Game Loop ---
  let lastTime = 0;
  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Color definitions based on night mode
    const mainColor = isNight ? '#e8eaed' : '#535353';
    const cloudColor = isNight ? '#444950' : '#d8d8d8';

    // Draw Night Moon / Stars
    if (isNight) {
      ctx.save();
      ctx.fillStyle = '#fef08a';
      // Pixel moon
      ctx.fillRect(720, 24, 20, 20);
      ctx.fillStyle = '#171717';
      ctx.fillRect(716, 20, 16, 16);
      // Twinkling stars
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(180, 30, 2, 2);
      ctx.fillRect(320, 50, 3, 3);
      ctx.fillRect(490, 25, 2, 2);
      ctx.fillRect(620, 45, 2, 2);
      ctx.restore();
    }

    // Clouds
    for (let c of clouds) {
      if (gameState === 'PLAYING') c.update();
      c.draw(ctx, cloudColor);
    }

    // Ground
    if (gameState === 'PLAYING') {
      ground.update(speed);
    }
    ground.draw(ctx, mainColor);

    // Obstacles & Collision Check
    const dinoHitbox = dino.getHitbox();

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      if (gameState === 'PLAYING') {
        obs.update(speed, delta);

        // Check collision
        if (checkCollision(dinoHitbox, obs.getHitbox())) {
          obs.draw(ctx, mainColor);
          dino.draw(ctx, mainColor);
          gameOver();
          return requestAnimationFrame(gameLoop);
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < -20) {
          obstacles.splice(i, 1);
          continue;
        }
      }
      obs.draw(ctx, mainColor);
    }

    // Spawn obstacles
    if (gameState === 'PLAYING') {
      distanceRan += speed;
      speed = Math.min(MAX_SPEED, INITIAL_SPEED + distanceRan * ACCELERATION * 0.05);

      obstacleTimer += delta;
      if (obstacleTimer > 0.8) {
        if (Math.random() < 0.35) {
          spawnObstacle();
        }
        obstacleTimer = 0;
      }

      updateScore();
    }

    // Dino
    dino.update(delta);
    dino.draw(ctx, mainColor);

    requestAnimationFrame(gameLoop);
  }

  // --- Input Handlers ---
  function handleJumpAction() {
    sound.init();
    if (gameState === 'START') {
      startOverlay.classList.add('hidden');
      gameState = 'PLAYING';
      dino.jump();
    } else if (gameState === 'GAMEOVER') {
      gameOverOverlay.classList.add('hidden');
      resetGame();
      gameState = 'PLAYING';
      dino.jump();
    } else if (gameState === 'PLAYING') {
      dino.jump();
    }
  }

  function handleDuckAction(isDucking) {
    keys.duck = isDucking;
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      keys.jump = true;
      handleJumpAction();
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      handleDuckAction(true);
    } else if (e.code === 'KeyM') {
      toggleSound();
    } else if (e.code === 'Enter') {
      if (gameState === 'START' || gameState === 'GAMEOVER') {
        handleJumpAction();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      keys.jump = false;
    } else if (e.code === 'ArrowDown') {
      handleDuckAction(false);
    }
  });

  // Buttons & UI Listeners
  startBtn.addEventListener('click', () => {
    handleJumpAction();
  });

  restartBtn.addEventListener('click', () => {
    handleJumpAction();
  });

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleJumpAction();
  });

  // Touch controls
  touchJumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJumpAction();
  });

  touchDuckBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDuckAction(true);
  });
  touchDuckBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleDuckAction(false);
  });

  function toggleSound() {
    const enabled = sound.toggle();
    soundBtn.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
  }

  soundBtn.addEventListener('click', () => {
    sound.init();
    toggleSound();
  });

  // Start the render loop
  requestAnimationFrame(gameLoop);
})();
