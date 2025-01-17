// Game variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let timerInterval = null;
let timeLeft = 60;
let bombCount = 3;
let clockCount = 3;
let skipCount = 3;
let currentGameType = null;

// Load high scores from localStorage
function loadHighScores(type) {
    const highScores = JSON.parse(localStorage.getItem(`${type}HighScores`)) || [];
    return highScores;
}

// Save high scores to localStorage
function saveHighScores(type, highScores) {
    localStorage.setItem(`${type}HighScores`, JSON.stringify(highScores));
}

// Update high scores display
function updateHighScoresDisplay() {
    // Update normal quiz high scores
    const normalHighScores = loadHighScores('normal');
    const normalHighScoresList = document.getElementById('normal-high-scores-list');
    normalHighScoresList.innerHTML = '';
    
    normalHighScores.sort((a, b) => b.score - a.score)
                   .slice(0, 10)
                   .forEach((scoreData, index) => {
        const li = document.createElement('li');
        li.textContent = `${scoreData.name}: ${scoreData.score}`;
        if (index < 3) {
            li.classList.add(`medal-${index + 1}`);
        }
        normalHighScoresList.appendChild(li);
    });
    
    // Update intermediate quiz high scores
    const intermediateHighScores = loadHighScores('intermediate');
    const intermediateHighScoresList = document.getElementById('intermediate-high-scores-list');
    intermediateHighScoresList.innerHTML = '';
    
    intermediateHighScores.sort((a, b) => b.score - a.score)
                        .slice(0, 10)
                        .forEach((scoreData, index) => {
        const li = document.createElement('li');
        li.textContent = `${scoreData.name}: ${scoreData.score}`;
        if (index < 3) {
            li.classList.add(`medal-${index + 1}`);
        }
        intermediateHighScoresList.appendChild(li);
    });
    
    // Update kids quiz high scores
    const kidsHighScores = loadHighScores('kids');
    const kidsHighScoresList = document.getElementById('kids-high-scores-list');
    kidsHighScoresList.innerHTML = '';
    
    kidsHighScores.sort((a, b) => b.score - a.score)
                 .slice(0, 10)
                 .forEach((scoreData, index) => {
        const li = document.createElement('li');
        li.textContent = `${scoreData.name}: ${scoreData.score}`;
        if (index < 3) {
            li.classList.add(`medal-${index + 1}`);
        }
        kidsHighScoresList.appendChild(li);
    });
}

// Add new score to high scores
function addHighScore(type, name, newScore) {
    const highScores = loadHighScores(type);
    highScores.push({ name, score: newScore });
    
    // Sort and keep only top 10
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10);
    
    saveHighScores(type, highScores);
    updateHighScoresDisplay();
}

// Wait for page to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');
    
    // Load and display high scores
    updateHighScoresDisplay();
    
    document.getElementById('start-normal-button').addEventListener('click', () => {
        const nickname = document.getElementById('nickname').value.trim();
        if (nickname) {
            startGame('normal');
        } else {
            alert('Please enter your nickname first!');
        }
    });

    document.getElementById('start-intermediate-button').addEventListener('click', () => {
        const nickname = document.getElementById('nickname').value.trim();
        if (nickname) {
            startGame('intermediate');
        } else {
            alert('Please enter your nickname first!');
        }
    });

    document.getElementById('start-kids-button').addEventListener('click', () => {
        const nickname = document.getElementById('nickname').value.trim();
        if (nickname) {
            startGame('kids');
        } else {
            alert('Please enter your nickname first!');
        }
    });
    
    // Setup explanation close button
    document.querySelector('#explanation-popup .close-button').addEventListener('click', () => {
        document.getElementById('explanation-popup').classList.add('hidden');
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            endGame();
        }
    });
    
    // Setup utility buttons
    document.getElementById('bomb-button').addEventListener('click', useBomb);
    document.getElementById('clock-button').addEventListener('click', useClock);
    document.getElementById('skip-button').addEventListener('click', useSkip);
    
    // Setup return to menu button
    document.getElementById('return-to-menu').addEventListener('click', returnToMenu);
});

function showExplosion() {
    const explosionContainer = document.createElement('div');
    explosionContainer.className = 'explosion-container';
    explosionContainer.innerHTML = '💥';
    document.body.appendChild(explosionContainer);
    
    setTimeout(() => {
        if (explosionContainer && explosionContainer.parentNode) {
            explosionContainer.parentNode.removeChild(explosionContainer);
        }
    }, 1000);
}

function useBomb() {
    if (bombCount <= 0) return;
    
    const question = currentQuestions[currentQuestionIndex];
    if (!question || question.type === 'truefalse') return;
    
    const buttons = Array.from(document.querySelectorAll('#option-buttons .option'));
    const wrongButtons = buttons.filter((button, index) => {
        return index !== question.correctOption && 
               !button.classList.contains('hidden') &&
               button.style.display !== 'none';
    });
    
    if (wrongButtons.length === 0) return;
    
    // Randomly select up to 2 wrong buttons
    wrongButtons.sort(() => Math.random() - 0.5);
    const buttonsToHide = wrongButtons.slice(0, Math.min(2, wrongButtons.length));
    
    buttonsToHide.forEach(button => {
        button.style.display = 'none';
    });
    
    bombCount--;
    document.getElementById('bomb-count').textContent = bombCount;
}

function useClock() {
    if (clockCount <= 0) return;
    
    // Add 30 seconds
    timeLeft += 30;
    document.getElementById('question-timer').textContent = `00:${timeLeft}`;
    
    // Update clock count
    clockCount--;
    document.getElementById('clock-count').textContent = clockCount;
}

function useSkip() {
    if (skipCount <= 0) return;
    
    // Skip current question without penalty
    skipCount--;
    document.getElementById('skip-count').textContent = skipCount;
    
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        endGame();
    }
}

function startGame(type) {
    console.log('Starting game:', type);
    
    // Reset game state
    currentQuestions = type === 'normal' ? [...window.normalQuestions] : 
                      type === 'intermediate' ? [...window.intermediateQuestions] :
                      [...window.kidsQuestions];
    
    // Shuffle questions
    for (let i = currentQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuestions[i], currentQuestions[j]] = [currentQuestions[j], currentQuestions[i]];
    }
    
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    bombCount = 3;
    clockCount = 3;
    skipCount = 3;
    
    // Save game type for later
    currentGameType = type;
    
    // Update UI
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '3';
    document.getElementById('question-timer').textContent = '00:60';
    document.getElementById('bomb-count').textContent = '3';
    document.getElementById('clock-count').textContent = '3';
    document.getElementById('skip-count').textContent = '3';
    
    // Show game screen
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    // Show first question
    showQuestion();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            handleTimeUp();
        }
    }, 1000);
}

function showQuestion() {
    console.log('Showing question:', currentQuestionIndex + 1);
    
    const question = currentQuestions[currentQuestionIndex];
    
    // Update question text
    document.getElementById('question').textContent = question.questionText;
    
    // Create options based on question type
    const optionsContainer = document.getElementById('option-buttons');
    const trueFalseContainer = document.getElementById('true-false-options');
    
    optionsContainer.innerHTML = '';
    
    if (question.type === 'truefalse') {
        // Show true/false options
        optionsContainer.classList.add('hidden');
        trueFalseContainer.classList.remove('hidden');
        
        // Set up true/false button handlers
        document.getElementById('true-option').onclick = () => checkAnswer(0);
        document.getElementById('false-option').onclick = () => checkAnswer(1);
        
        // Enable both buttons
        document.getElementById('true-option').disabled = false;
        document.getElementById('false-option').disabled = false;
        
        // Reset button styles
        document.getElementById('true-option').className = 'option';
        document.getElementById('false-option').className = 'option';
    } else {
        // Show multiple choice options
        optionsContainer.classList.remove('hidden');
        trueFalseContainer.classList.add('hidden');
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.onclick = () => checkAnswer(index);
            optionsContainer.appendChild(button);
        });
    }
    
    // Update question counter
    document.getElementById('question-counter').textContent = 
        `Question: ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // Start timer
    startTimer();
}

function checkAnswer(selectedIndex) {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const question = currentQuestions[currentQuestionIndex];
    let options;
    
    // Get visible options only
    const allOptions = document.querySelectorAll('#option-buttons .option');
    options = Array.from(allOptions).filter(option => !option.classList.contains('hidden'));
    
    if (question.type === 'truefalse') {
        options = [
            document.getElementById('true-option'),
            document.getElementById('false-option')
        ];
    }
    
    // Disable all buttons immediately
    options.forEach(button => button.disabled = true);
    
    const explanation = document.getElementById('explanation-popup');
    const scoreDisplay = document.getElementById('score');
    
    // Handle scoring first, before any async operations
    if (selectedIndex === question.correctOption) {
        console.log('Correct answer selected:', selectedIndex);
        options[selectedIndex].classList.add('correct');
        score++;
        console.log('New score:', score);
        scoreDisplay.textContent = score.toString();
        
        // Check if it's a special score
        const isSpecialScore = score % 5 === 0;
        const isSuperScore = score % 10 === 0;
        
        // Start animations independently
        animateTrophyToScore(isSpecialScore && !isSuperScore, isSuperScore);
        
        // Move to next question after 1 second regardless of animation
        setTimeout(moveToNextQuestion, 1000);
    } else {
        console.log('Wrong answer selected:', selectedIndex);
        if (selectedIndex >= 0) {
            options[selectedIndex].classList.add('incorrect');
        }
        options[question.correctOption].classList.add('correct');
        
        // Start sword animation independently
        animateSwordStrike();
        
        // Update lives counter after strike animation
        lives--;
        setTimeout(() => {
            document.getElementById('lives').textContent = lives.toString();
            
            if (lives <= 0) {
                setTimeout(endGame, 200);
                return;
            }
        }, 2800);
        
        // Show explanation and wait for close button
        document.getElementById('explanation-text').textContent = question.explanation;
        explanation.classList.remove('hidden');
        
        // Remove any existing event listener
        const closeButton = document.getElementById('close-explanation');
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        // Add new event listener - only move to next question when close button is clicked
        newCloseButton.addEventListener('click', () => {
            explanation.classList.add('hidden');
            moveToNextQuestion();
        });
    }
}

// Separate function to handle moving to next question
function moveToNextQuestion() {
    const explanation = document.getElementById('explanation-popup');
    explanation.classList.add('hidden');
    
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Hide quiz screen
    document.getElementById('quiz-screen').classList.add('hidden');
    
    // Show result screen
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
    
    // Add score to high scores
    const nickname = document.getElementById('nickname').value.trim();
    addHighScore(currentGameType, nickname, score);
}

function returnToMenu() {
    // Hide all screens
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('explanation-popup').classList.add('hidden');
    
    // Show home screen
    document.getElementById('home-screen').classList.remove('hidden');
    
    // Clear any running timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Function to create firework particles
function createFireworks(element) {
    const rect = element.getBoundingClientRect();
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.innerHTML = '💥';
    document.body.appendChild(firework);
    
    // Position exactly on score counter
    firework.style.top = `${rect.top + rect.height / 2}px`;
    firework.style.left = `${rect.left + rect.width / 2}px`;
    
    setTimeout(() => {
        document.body.removeChild(firework);
    }, 500);
}

// Function to animate sword strike
function animateSwordStrike() {
    const livesElement = document.getElementById('lives');
    const livesRect = livesElement.getBoundingClientRect();
    
    // Create single big sword
    const sword = document.createElement('div');
    sword.className = 'sword-animation';
    sword.innerHTML = '🗡️';
    document.body.appendChild(sword);
    
    // Set initial position (top right of screen)
    sword.style.top = `${window.innerHeight * 0.2}px`;
    sword.style.left = `${window.innerWidth * 0.8}px`;
    sword.style.transform = 'rotate(-45deg) scale(1.5)';
    
    // Force reflow
    sword.offsetHeight;
    
    // Animate to lives counter
    requestAnimationFrame(() => {
        sword.style.top = `${livesRect.top + livesRect.height / 2}px`;
        sword.style.left = `${livesRect.left + livesRect.width / 2}px`;
        
        // Add strike effect when sword reaches target
        setTimeout(() => {
            sword.classList.add('animate');
            livesElement.classList.add('strike');
        }, 2700);
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(sword);
            livesElement.classList.remove('strike');
        }, 3000);
    });
}

// Function to create and animate trophy with pigeon
function animateTrophyToScore(isSpecial = false, isSuper = false) {
    const scoreElement = document.getElementById('score');
    const scoreRect = scoreElement.getBoundingClientRect();
    
    if (isSuper) {
        // Create pigeon with trophy
        const pigeonContainer = document.createElement('div');
        pigeonContainer.className = 'pigeon-container';
        
        const pigeon = document.createElement('div');
        pigeon.className = 'pigeon';
        pigeon.innerHTML = '🕊️';
        
        const trophy = document.createElement('div');
        trophy.className = 'trophy-super';
        trophy.innerHTML = '🏆';
        
        pigeonContainer.appendChild(pigeon);
        pigeonContainer.appendChild(trophy);
        document.body.appendChild(pigeonContainer);
        
        // Set initial position (center of screen)
        pigeonContainer.style.top = `${window.innerHeight / 2 - 80}px`;
        pigeonContainer.style.left = `${window.innerWidth / 2 - 40}px`;
        
        // Create multiple waves of fireworks during the animation
        for (let i = 0; i < 4; i++) {
            setTimeout(() => createFireworks(scoreElement), i * 1000);
        }
        
        // Highlight score with super effect
        scoreElement.classList.add('highlight', 'super');
        
        // Force reflow
        pigeonContainer.offsetHeight;
        
        // Animate to score with slight delay for scale
        requestAnimationFrame(() => {
            pigeonContainer.style.top = `${scoreRect.top - 40}px`;
            pigeonContainer.style.left = `${scoreRect.left - 20}px`;
            
            // Add animate class after reaching destination
            setTimeout(() => {
                pigeonContainer.classList.add('animate');
            }, 3500);
        });
        
        // Clean up after animation
        setTimeout(() => {
            document.body.removeChild(pigeonContainer);
            scoreElement.classList.remove('highlight', 'super');
        }, 4000);
        
        return;
    }
    
    // Regular or special trophy animation
    const trophy = document.createElement('div');
    trophy.className = 'trophy-animation' + (isSpecial ? ' special' : '');
    trophy.innerHTML = '🏆';
    document.body.appendChild(trophy);
    
    // Set initial position (center of screen)
    trophy.style.top = `${window.innerHeight / 2 - 60}px`;
    trophy.style.left = `${window.innerWidth / 2 - 60}px`;
    
    // Force reflow
    trophy.offsetHeight;
    
    // Create multiple waves of fireworks for special animation
    if (isSpecial) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createFireworks(scoreElement), i * 1000);
        }
    }
    
    // Animate to score position
    requestAnimationFrame(() => {
        trophy.style.top = `${scoreRect.top}px`;
        trophy.style.left = `${scoreRect.left}px`;
        trophy.classList.add('animate');
        
        // Highlight score and create fireworks
        scoreElement.classList.add('highlight');
        if (isSpecial) {
            scoreElement.classList.add('special');
        }
        createFireworks(scoreElement);
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(trophy);
            scoreElement.classList.remove('highlight', 'special');
        }, isSpecial ? 3000 : 2000);
    });
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('question-timer');
    timerElement.textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
}

function handleTimeUp() {
    checkAnswer(-1);
}
