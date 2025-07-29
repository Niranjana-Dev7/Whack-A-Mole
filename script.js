class WhackAMoleGame {
    constructor() {
        console.log('Initializing Whack-A-Mole Game...');

        // Game state
        this.gameState = {
            isPlaying: false,
            score: 0,
            timeLeft: 30,
            combo: 0,
            highestCombo: 0,
            level: 1
        };

        // Power-up state
        this.powerUps = {
            speedBoost: {
                active: false,
                duration: 8000, // 8 seconds
                cooldown: 15000, // 15 seconds
                lastUsed: 0
            },
            doublePoints: {
                active: false,
                duration: 10000, // 10 seconds
                cooldown: 20000, // 20 seconds
                lastUsed: 0
            },
            freezeTime: {
                active: false,
                duration: 6000, // 6 seconds
                cooldown: 25000, // 25 seconds
                lastUsed: 0
            }
        };

        // Difficulty levels
        this.difficultyLevels = {
            easy: {
                name: 'Easy',
                moleUpTime: 2500,      // Moles stay up longer
                spawnInterval: 1800,    // Longer gap between spawns
                goldenChance: 0.25,     // More golden moles
                bombChance: 0.05,       // Fewer bombs
                maxSimultaneousMoles: 1 // Only 1 mole at a time
            },
            medium: {
                name: 'Medium',
                moleUpTime: 1500,      // Standard timing
                spawnInterval: 1200,    // Standard gap
                goldenChance: 0.15,     // Standard golden chance
                bombChance: 0.1,        // Standard bomb chance
                maxSimultaneousMoles: 2 // Up to 2 moles at once
            },
            hard: {
                name: 'Hard',
                moleUpTime: 1000,      // Moles disappear quickly
                spawnInterval: 800,     // Short gap between spawns
                goldenChance: 0.1,      // Fewer golden moles
                bombChance: 0.15,       // More bombs
                maxSimultaneousMoles: 3 // Up to 3 moles at once
            }
        };

        // Current difficulty (default to easy)
        this.currentDifficulty = 'easy';
        this.settings = this.difficultyLevels[this.currentDifficulty];

        // Timers
        this.gameTimer = null;
        this.spawnTimer = null;

        // Get DOM elements
        this.holes = document.querySelectorAll('.hole');
        this.moles = document.querySelectorAll('.mole');

        console.log(`Found ${this.holes.length} holes and ${this.moles.length} moles`);

        // Power-up elements
        this.powerUpElements = {
            speedBoost: document.getElementById('speedBoost'),
            doublePoints: document.getElementById('doublePoints'),
            freezeTime: document.getElementById('freezeTime')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateDifficultyButtons();
        this.displayDifficultyInfo();
        console.log('Game initialized successfully');
    }



    setDifficulty(level) {
        const validLevels = Object.keys(this.difficultyLevels);

        if (!validLevels.includes(level)) {
            console.error(`Invalid difficulty level: ${level}`);
            console.log(`Valid levels: ${validLevels.join(', ')}`);
            return false;
        }

        // Stop game if playing
        if (this.gameState.isPlaying) {
            console.log('Stopping current game to change difficulty...');
            this.resetGame();
        }

        this.currentDifficulty = level;
        this.settings = this.difficultyLevels[level];

        console.log(`Difficulty set to: ${this.settings.name}`);
        this.displayDifficultyInfo();
        this.updateDisplay();
        this.updateDifficultyButtons();

        return true;
    }

    updateDifficultyButtons() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            const difficulty = btn.dataset.difficulty;

            // Update active state
            if (difficulty === this.currentDifficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }

            // Disable buttons during gameplay
            if (this.gameState.isPlaying) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    }

    displayDifficultyInfo() {
        const current = this.difficultyLevels[this.currentDifficulty];
        console.log(`🎮 Current Difficulty: ${current.name}`);
        console.log(`⏱️  Mole visible time: ${current.moleUpTime}ms`);
        console.log(`🕐 Spawn interval: ${current.spawnInterval}ms`);
        console.log(`✨ Golden mole chance: ${(current.goldenChance * 100).toFixed(1)}%`);
        console.log(`💣 Bomb chance: ${(current.bombChance * 100).toFixed(1)}%`);
        console.log(`🐭 Max simultaneous moles: ${current.maxSimultaneousMoles}`);
    }

    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            console.log('Start button clicked');
            this.startGame();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            console.log('Reset button clicked');
            this.resetGame();
        });

        // Instructions button
        document.getElementById('instructionsBtn').addEventListener('click', () => {
            this.showInstructions();
        });

        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // Close instructions button
        document.getElementById('closeInstructionsBtn').addEventListener('click', () => {
            this.hideInstructions();
        });

        // Difficulty button events
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.setDifficulty(difficulty);
            });
        });

        // Mole click events - individual handlers for each mole
        this.moles.forEach((mole, index) => {
            mole.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Mole ${index} clicked!`);
                this.handleMoleClick(index);
            });
        });

        // Modal close events
        document.getElementById('gameOverModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameOverModal') this.hideGameOver();
        });

        document.getElementById('instructionsModal').addEventListener('click', (e) => {
            if (e.target.id === 'instructionsModal') this.hideInstructions();
        });
    }

    startGame() {
        console.log('=== STARTING GAME ===');

        // Reset game state (preserve highest combo from previous games)
        const previousHighestCombo = this.gameState.highestCombo;
        this.gameState = {
            isPlaying: true,
            score: 0,
            timeLeft: 30,
            combo: 0,
            highestCombo: previousHighestCombo,
            level: 1
        };

        console.log('Game state reset:', this.gameState);

        // Update UI
        document.getElementById('startBtn').textContent = 'Playing...';
        document.getElementById('startBtn').disabled = true;
        this.hideGameOver();
        this.hideAllMoles();
        this.updateDisplay();
        this.updateDifficultyButtons(); // Disable difficulty buttons during game

        // Reset power-ups
        this.resetPowerUps();

        // Start timers
        this.startGameTimer();
        this.startMoleSpawning();

        console.log('Game started successfully');
    }

    resetGame() {
        console.log('=== RESETTING GAME ===');

        // Stop all timers
        this.stopAllTimers();

        // Reset game state (preserve highest combo across resets)
        const previousHighestCombo = this.gameState.highestCombo;
        this.gameState = {
            isPlaying: false,
            score: 0,
            timeLeft: 30,
            combo: 0,
            highestCombo: previousHighestCombo,
            level: 1
        };

        // Update UI
        this.hideAllMoles();
        this.hideGameOver();
        this.updateDisplay();
        this.updateDifficultyButtons(); // Re-enable difficulty buttons

        document.getElementById('startBtn').textContent = 'Start Game';
        document.getElementById('startBtn').disabled = false;

        console.log('Game reset complete');
    }

    startGameTimer() {
        console.log('Starting game timer');
        this.gameTimer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateDisplay();

            if (this.gameState.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    startMoleSpawning() {
        console.log('Starting mole spawning');
        this.spawnMole();
    }

    spawnMole() {
        if (!this.gameState.isPlaying) {
            console.log('Game not playing, stopping spawn');
            return;
        }

        // Count currently active moles
        const activeMoles = Array.from(this.moles).filter(mole =>
            mole.classList.contains('up')
        ).length;

        console.log(`Active moles: ${activeMoles}, Max allowed: ${this.settings.maxSimultaneousMoles}`);

        // Only spawn if we haven't reached the maximum
        if (activeMoles < this.settings.maxSimultaneousMoles) {
            // Find available holes (moles that are not currently up)
            const availableHoles = [];
            this.moles.forEach((mole, index) => {
                if (!mole.classList.contains('up')) {
                    availableHoles.push(index);
                }
            });

            console.log(`Available holes: ${availableHoles.length}`);

            if (availableHoles.length > 0) {
                // Pick a random available hole
                const randomIndex = Math.floor(Math.random() * availableHoles.length);
                const holeIndex = availableHoles[randomIndex];

                // Determine mole type
                const moleType = this.getMoleType();

                console.log(`Spawning ${moleType} mole at hole ${holeIndex} (Difficulty: ${this.currentDifficulty})`);
                this.showMole(holeIndex, moleType);
            }
        } else {
            console.log(`Max moles (${this.settings.maxSimultaneousMoles}) already active, skipping spawn`);
        }

        // Schedule next spawn
        this.spawnTimer = setTimeout(() => {
            this.spawnMole();
        }, this.settings.spawnInterval);
    }

    getMoleType() {
        const rand = Math.random();

        // Check for power-up spawn (5% chance)
        if (rand < 0.05) {
            return this.getAvailablePowerUpType();
        } else if (rand < 0.05 + this.settings.bombChance) {
            return 'bomb';
        } else if (rand < 0.05 + this.settings.bombChance + this.settings.goldenChance) {
            return 'golden';
        } else {
            return 'regular';
        }
    }

    getAvailablePowerUpType() {
        const now = Date.now();
        const availablePowerUps = [];

        // Check which power-ups are available (not active and not on cooldown)
        Object.keys(this.powerUps).forEach(powerUpName => {
            const powerUp = this.powerUps[powerUpName];
            if (!powerUp.active && (now - powerUp.lastUsed) >= powerUp.cooldown) {
                availablePowerUps.push(powerUpName);
            }
        });

        // If no power-ups available, return regular mole
        if (availablePowerUps.length === 0) {
            return 'regular';
        }

        // Return random available power-up
        const randomIndex = Math.floor(Math.random() * availablePowerUps.length);
        return availablePowerUps[randomIndex];
    }

    showMole(holeIndex, type = 'regular') {
        const mole = this.moles[holeIndex];

        console.log(`Showing ${type} mole at hole ${holeIndex}`);

        // Clear previous classes and set new type
        mole.classList.remove('up', 'golden', 'bomb', 'speedBoost', 'doublePoints', 'freezeTime');
        mole.dataset.type = type;

        if (type !== 'regular') {
            mole.classList.add(type);
        }

        // Show the mole
        mole.classList.add('up');

        console.log(`Mole ${holeIndex} is now visible with classes:`, mole.classList.toString());

        // Hide mole after timeout
        setTimeout(() => {
            if (mole.classList.contains('up')) {
                console.log(`Mole ${holeIndex} timed out`);
                this.hideMole(holeIndex);
                // Only count as missed if it wasn't a bomb or power-up
                if (type !== 'bomb' && !this.isPowerUpType(type)) {
                    this.gameState.combo = 0;
                    this.updateDisplay();
                }
            }
        }, this.settings.moleUpTime);
    }

    isPowerUpType(type) {
        return ['speedBoost', 'doublePoints', 'freezeTime'].includes(type);
    }

    hideMole(holeIndex) {
        const mole = this.moles[holeIndex];
        mole.classList.remove('up', 'golden', 'bomb', 'speedBoost', 'doublePoints', 'freezeTime');
        delete mole.dataset.type;
        console.log(`Mole ${holeIndex} hidden`);
    }

    hideAllMoles() {
        console.log('Hiding all moles');
        this.moles.forEach((mole, index) => {
            this.hideMole(index);
        });
    }

    handleMoleClick(holeIndex) {
        console.log(`=== MOLE CLICK HANDLER: Hole ${holeIndex} ===`);

        const mole = this.moles[holeIndex];

        // Check if game is playing
        if (!this.gameState.isPlaying) {
            console.log('Game not playing, ignoring click');
            return;
        }

        // Check if mole is up
        if (!mole.classList.contains('up')) {
            console.log('Mole not up, ignoring click');
            return;
        }

        const moleType = mole.dataset.type || 'regular';
        console.log(`Valid hit on ${moleType} mole!`);

        // Handle power-up activation
        if (this.isPowerUpType(moleType)) {
            this.activatePowerUp(moleType);
            // Power-ups don't give points but don't break combo either
        } else {
            // Calculate points for regular moles
            let points = this.calculatePoints(moleType);

            console.log(`Points calculated: ${points}`);
            console.log(`Score before: ${this.gameState.score}`);

            // Update score
            this.gameState.score += points;

            console.log(`Score after: ${this.gameState.score}`);

            // Update combo
            if (moleType !== 'bomb') {
                this.gameState.combo++;
                // Update highest combo if current combo is higher
                if (this.gameState.combo > this.gameState.highestCombo) {
                    this.gameState.highestCombo = this.gameState.combo;
                    console.log(`New highest combo: ${this.gameState.highestCombo}`);
                }
            } else {
                this.gameState.combo = 0;
            }

            // Show floating points for non-power-up hits
            this.showFloatingPoints(holeIndex, points, moleType);
        }

        // Hide the mole
        this.hideMole(holeIndex);

        // Update display
        this.updateDisplay();

        console.log(`=== HIT COMPLETE ===`);
    }

    calculatePoints(moleType) {
        let points = 0;

        switch (moleType) {
            case 'golden':
                points = 50;
                break;
            case 'bomb':
                points = -20;
                break;
            default: // regular
                points = 10;
                break;
        }

        // Apply combo multiplier for positive hits
        if (points > 0 && this.gameState.combo > 0) {
            const multiplier = 1 + (this.gameState.combo * 0.1);
            points = Math.floor(points * Math.min(multiplier, 3)); // Max 3x
        }

        // Apply double points power-up for positive hits
        if (points > 0 && this.powerUps.doublePoints.active) {
            points *= 2;
        }

        return points;
    }

    showFloatingPoints(holeIndex, points, moleType) {
        const hole = this.holes[holeIndex];
        const rect = hole.getBoundingClientRect();
        const gameContainer = document.querySelector('.game-container');
        const containerRect = gameContainer.getBoundingClientRect();

        const floatingPoint = document.createElement('div');
        floatingPoint.className = 'floating-point';

        if (points < 0) {
            floatingPoint.classList.add('negative');
            floatingPoint.textContent = points;
        } else {
            floatingPoint.textContent = `+${points}`;
            if (moleType === 'golden') {
                floatingPoint.classList.add('golden');
            }
        }

        floatingPoint.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
        floatingPoint.style.top = (rect.top - containerRect.top) + 'px';

        document.getElementById('floatingPoints').appendChild(floatingPoint);

        setTimeout(() => {
            floatingPoint.remove();
        }, 1000);
    }

    updateDisplay() {
        console.log('Updating display - Score:', this.gameState.score, 'Combo:', this.gameState.combo, 'Highest:', this.gameState.highestCombo);

        // Update score
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.gameState.score;
        }

        // Update time
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = this.gameState.timeLeft;
        }

        // Update combo
        const comboElement = document.getElementById('combo');
        if (comboElement) {
            comboElement.textContent = this.gameState.combo + 'x';
        }

        // Update level (show difficulty instead of numeric level)
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.difficultyLevels[this.currentDifficulty].name;
        }
    }

    stopAllTimers() {
        console.log('Stopping all timers');
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
    }

    endGame() {
        console.log('=== GAME ENDED ===');
        this.gameState.isPlaying = false;
        this.stopAllTimers();
        this.hideAllMoles();

        document.getElementById('startBtn').textContent = 'Start Game';
        document.getElementById('startBtn').disabled = false;
        this.updateDifficultyButtons(); // Re-enable difficulty buttons

        this.showGameOver();
    }







    showGameOver() {
        console.log('=== GAME OVER ===');
        console.log('Final Score:', this.gameState.score);
        console.log('Highest Combo:', this.gameState.highestCombo);
        console.log('Difficulty:', this.difficultyLevels[this.currentDifficulty].name);

        document.getElementById('finalScore').textContent = this.gameState.score;
        document.getElementById('highestCombo').textContent = this.gameState.highestCombo;
        document.getElementById('finalLevel').textContent = this.difficultyLevels[this.currentDifficulty].name;
        document.getElementById('gameOverModal').style.display = 'flex';

        console.log('Game over modal displayed');
    }

    hideGameOver() {
        document.getElementById('gameOverModal').style.display = 'none';
    }

    showInstructions() {
        document.getElementById('instructionsModal').style.display = 'flex';
    }

    hideInstructions() {
        document.getElementById('instructionsModal').style.display = 'none';
    }

    // Power-up system methods

    activatePowerUp(powerUpName) {
        console.log(`Activating power-up: ${powerUpName}`);

        const powerUp = this.powerUps[powerUpName];
        powerUp.active = true;
        powerUp.lastUsed = Date.now();

        // Apply power-up effect
        switch (powerUpName) {
            case 'speedBoost':
                this.applySpeedBoost();
                break;
            case 'doublePoints':
                this.applyDoublePoints();
                break;
            case 'freezeTime':
                this.applyFreezeTime();
                break;
        }

        // Update UI
        this.updatePowerUpUI(powerUpName);

        // Show power-up activation message
        this.showPowerUpMessage(powerUpName);

        // Play power-up sound
        if (window.soundManager) {
            window.soundManager.playPowerUpSound();
        }

        // Set timer to deactivate
        setTimeout(() => {
            this.deactivatePowerUp(powerUpName);
        }, powerUp.duration);
    }

    applySpeedBoost() {
        // Reduce spawn interval by 40%
        this.originalSpawnInterval = this.settings.spawnInterval;
        this.settings.spawnInterval = Math.floor(this.settings.spawnInterval * 0.6);
        console.log(`Speed boost: spawn interval reduced from ${this.originalSpawnInterval} to ${this.settings.spawnInterval}`);
    }

    applyDoublePoints() {
        // Double points flag will be checked in calculatePoints method
        console.log('Double points activated');
    }

    applyFreezeTime() {
        // Pause the game timer
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        console.log('Time frozen');
    }

    deactivatePowerUp(powerUpName) {
        console.log(`Deactivating power-up: ${powerUpName}`);

        const powerUp = this.powerUps[powerUpName];
        powerUp.active = false;

        // Remove power-up effect
        switch (powerUpName) {
            case 'speedBoost':
                this.removeSpeedBoost();
                break;
            case 'doublePoints':
                this.removeDoublePoints();
                break;
            case 'freezeTime':
                this.removeFreezeTime();
                break;
        }

        // Update UI
        this.updatePowerUpUI(powerUpName);
    }

    removeSpeedBoost() {
        // Restore original spawn interval
        if (this.originalSpawnInterval) {
            this.settings.spawnInterval = this.originalSpawnInterval;
            console.log(`Speed boost ended: spawn interval restored to ${this.settings.spawnInterval}`);
        }
    }

    removeDoublePoints() {
        console.log('Double points ended');
    }

    removeFreezeTime() {
        // Resume the game timer if game is still playing
        if (this.gameState.isPlaying && !this.gameTimer) {
            this.startGameTimer();
        }
        console.log('Time unfrozen');
    }

    updatePowerUpUI(powerUpName) {
        const element = this.powerUpElements[powerUpName];
        if (!element) return;

        const powerUp = this.powerUps[powerUpName];
        const progressBar = element.querySelector('.power-up-progress');

        if (powerUp.active) {
            element.classList.add('active');

            // Animate progress bar
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transition = `width ${powerUp.duration}ms linear`;

                // Animate to 0% over the duration
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 50);
            }
        } else {
            element.classList.remove('active');

            // Reset progress bar
            if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.style.transition = 'none';
            }
        }
    }

    resetPowerUps() {
        // Deactivate all power-ups
        Object.keys(this.powerUps).forEach(powerUpName => {
            if (this.powerUps[powerUpName].active) {
                this.deactivatePowerUp(powerUpName);
            }
        });

        // Reset all power-up states
        Object.keys(this.powerUps).forEach(powerUpName => {
            this.powerUps[powerUpName].active = false;
            this.powerUps[powerUpName].lastUsed = 0;
            this.updatePowerUpUI(powerUpName);
        });

        console.log('Power-ups reset');
    }

    showPowerUpMessage(powerUpName) {
        const messages = {
            speedBoost: 'SPEED BOOST!',
            doublePoints: 'DOUBLE POINTS!',
            freezeTime: 'TIME FROZEN!'
        };

        const message = messages[powerUpName];
        if (!message) return;

        // Create floating message element
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Fredoka One', cursive;
            font-size: 2rem;
            font-weight: bold;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            z-index: 1000;
            pointer-events: none;
            animation: powerUpMessageFloat 2s ease-out forwards;
        `;

        document.body.appendChild(messageElement);

        // Remove element after animation
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 2000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.soundManager = new SoundManager();
    new WhackAMoleGame();
});

// Add some basic sound effects (optional - using Web Audio API)
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio API not supported');
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playHitSound() {
        this.playTone(800, 0.1);
    }

    playMissSound() {
        this.playTone(200, 0.2, 'sawtooth');
    }

    playPowerUpSound() {
        this.playTone(1200, 0.3);
    }
}

// Initialize sound manager
const soundManager = new SoundManager(); 