// --- Elements ---
const grid = document.getElementById('game-grid');
const movesDisplay = document.getElementById('moves');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');
const diffBtns = document.getElementById('diff-btns');
const playAgainBtn = document.getElementById('play-again-btn');
const soundBtn = document.getElementById('sound-btn');

// --- Audio Objects ---
const soundFlip = document.getElementById('sound-flip');
const soundMatch = document.getElementById('sound-match');
const soundWin = document.getElementById('sound-win');
const soundLose = document.getElementById('sound-lose');

let soundEnabled = true;

// --- Game State ---
let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
let moves = 0;
let timer;
let timeLeft;
let gameActive = false;

// --- Assets (Emojis) ---
const items = ['🧸', '🎀', '⭐', '❤️', '🌸', '🍭', '🌙', '🍬']; 

// --- Configuration ---
const levels = {
    easy: { pairs: 6, time: 60, cols: 3 },    // 12 cards
    medium: { pairs: 8, time: 45, cols: 4 },  // 16 cards
    hard: { pairs: 10, time: 35, cols: 4 }    // 20 cards
};

// --- Sound Functions ---
function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        soundBtn.innerText = "🔊 Sound On";
        soundBtn.style.opacity = "1";
    } else {
        soundBtn.innerText = "🔇 Sound Off";
        soundBtn.style.opacity = "0.7";
    }
}

function playSound(audioElement) {
    if (!soundEnabled) return;

    // Reset audio to start
    audioElement.currentTime = 0;
    // Set volume to 50%
    audioElement.volume = 0.5;

    // Try to play (handles browser autoplay policies)
    const playPromise = audioElement.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Audio playback prevented by browser.");
        });
    }
}

// --- Game Logic ---
function startGame(difficulty) {
    const config = levels[difficulty];
    score = 0;
    moves = 0;
    timeLeft = config.time;
    gameActive = true;
    
    // UI Updates
    scoreDisplay.innerText = score;
    movesDisplay.innerText = moves;
    timerDisplay.innerText = timeLeft;
    modal.classList.add('hidden');
    
    // Grid Setup
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    
    // Deck Creation
    const deck = [...items.slice(0, config.pairs), ...items.slice(0, config.pairs)];
    shuffle(deck);
    
    // Card Rendering
    deck.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = item;
        card.innerHTML = `<div class="front">${item}</div><div class="back"></div>`;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
    
    // Timer Logic
    clearInterval(timer);
    timer = setInterval(() => {
        if(!gameActive) return;
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        
        if(timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    playSound(soundFlip);
    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesDisplay.innerText = moves;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.value === secondCard.dataset.value;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    playSound(soundMatch);
    score += 10;
    scoreDisplay.innerText = score;
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
    
    // Check Win
    if (document.querySelectorAll('.card:not(.flipped)').length === 0) {
        setTimeout(() => endGame(true), 500);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function endGame(win) {
    gameActive = false;
    clearInterval(timer);
    
    modal.classList.remove('hidden');
    diffBtns.classList.add('hidden');
    playAgainBtn.classList.remove('hidden');
    
    if (win) {
        playSound(soundWin);
        modalTitle.innerText = "You Won! 🎉";
        modalMsg.innerText = `Final Score: ${score} | Time Left: ${timeLeft}s`;
    } else {
        playSound(soundLose);
        modalTitle.innerText = "Time's Up! 😢";
        modalMsg.innerText = "Don't give up!";
    }
}