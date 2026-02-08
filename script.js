// Definición de preguntas con opciones
const QUESTIONS = [
    {
        id: 'birth',
        question: '¿Cuándo nació Body?',
        correctAnswer: '26 de Noviembre 2023',
        options: [
            '26 de Noviembre 2023',
            '15 de Octubre 2023',
            '03 de Diciembre 2023',
            '18 de Septiembre 2023',
            '22 de Agosto 2023',
            '07 de Enero 2024'
        ]
    },
    {
        id: 'death',
        question: '¿Cuándo falleció Body?',
        correctAnswer: '08 de Febrero 2026',
        options: [
            '08 de Febrero 2026',
            '15 de Enero 2026',
            '22 de Febrero 2026',
            '01 de Marzo 2026',
            '28 de Enero 2026',
            '12 de Febrero 2026'
        ]
    },
    {
        id: 'nickname',
        question: '¿Cuál era su apodo?',
        correctAnswer: 'Body',
        options: [
            'Body',
            'Peabody',
            'Boddy',
            'Bobby',
            'Peabo',
            'Bodi'
        ]
    }
];

// Constantes
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
const LOCKOUT_KEY = 'memorial_lockout_until';

// Elementos del DOM
const verificationPage = document.getElementById('verification-page');
const memorialPage = document.getElementById('memorial-page');
const questionsContainer = document.getElementById('questions-container');
const verifyBtn = document.getElementById('verify-btn');
const errorMessage = document.getElementById('error-message');
const lockoutMessage = document.getElementById('lockout-message');

// Almacenar el orden aleatorio de las preguntas
let shuffledQuestions = [];

// Función para mezclar un array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Función para mezclar las opciones de cada pregunta
function shuffleOptions(options) {
    return shuffleArray(options);
}

// Generar las preguntas en orden aleatorio
function generateQuestions() {
    // Mezclar el orden de las preguntas
    shuffledQuestions = shuffleArray(QUESTIONS);

    questionsContainer.innerHTML = '';

    shuffledQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';

        const questionLabel = document.createElement('label');
        questionLabel.className = 'question-label';
        questionLabel.textContent = `${index + 1}. ${question.question}`;
        questionDiv.appendChild(questionLabel);

        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'options-grid';

        // Mezclar las opciones
        const shuffledOptions = shuffleOptions(question.options);

        shuffledOptions.forEach((option, optionIndex) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = question.id;
            radioInput.value = option;
            radioInput.id = `${question.id}_${optionIndex}`;

            const optionLabel = document.createElement('label');
            optionLabel.className = 'option-label';
            optionLabel.htmlFor = `${question.id}_${optionIndex}`;
            optionLabel.textContent = option;

            optionItem.appendChild(radioInput);
            optionItem.appendChild(optionLabel);
            optionsGrid.appendChild(optionItem);
        });

        questionDiv.appendChild(optionsGrid);
        questionsContainer.appendChild(questionDiv);
    });
}

// Verificar si hay un bloqueo activo al cargar la página
function checkLockout() {
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);

    if (lockoutUntil) {
        const lockoutTime = parseInt(lockoutUntil);
        const now = Date.now();

        if (now < lockoutTime) {
            // Aún está bloqueado
            startLockoutTimer(lockoutTime - now);
            return true;
        } else {
            // El bloqueo expiró
            localStorage.removeItem(LOCKOUT_KEY);
        }
    }

    return false;
}

// Iniciar temporizador de bloqueo
function startLockoutTimer(duration) {
    verifyBtn.disabled = true;
    disableAllInputs(true);

    updateLockoutDisplay(duration);

    const interval = setInterval(() => {
        duration -= 1000;

        if (duration <= 0) {
            clearInterval(interval);
            endLockout();
        } else {
            updateLockoutDisplay(duration);
        }
    }, 1000);
}

// Deshabilitar/habilitar todos los inputs
function disableAllInputs(disabled) {
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.disabled = disabled;
    });
}

// Actualizar visualización del tiempo de bloqueo
function updateLockoutDisplay(duration) {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    lockoutMessage.textContent = `Acceso bloqueado. Intenta nuevamente en ${minutes}:${seconds.toString().padStart(2, '0')}`;
    lockoutMessage.classList.add('show');
    errorMessage.classList.remove('show');
}

// Finalizar bloqueo
function endLockout() {
    verifyBtn.disabled = false;
    disableAllInputs(false);

    lockoutMessage.classList.remove('show');
    localStorage.removeItem(LOCKOUT_KEY);
}

// Activar bloqueo
function activateLockout() {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
    startLockoutTimer(LOCKOUT_DURATION);
}

// Verificar respuestas
function verifyAnswers() {
    let allAnswered = true;
    let allCorrect = true;

    // Verificar cada pregunta
    shuffledQuestions.forEach(question => {
        const selectedOption = document.querySelector(`input[name="${question.id}"]:checked`);

        if (!selectedOption) {
            allAnswered = false;
        } else if (selectedOption.value !== question.correctAnswer) {
            allCorrect = false;
        }
    });

    // Validar que todas las preguntas estén respondidas
    if (!allAnswered) {
        showError('Por favor, responde todas las preguntas.');
        return;
    }

    if (allCorrect) {
        // Todas las respuestas son correctas
        showMemorial();
    } else {
        // Al menos una respuesta es incorrecta
        showError('Respuestas incorrectas. Acceso denegado.');
        activateLockout();
    }
}

// Mostrar mensaje de error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

// Mostrar página del memorial
function showMemorial() {
    verificationPage.classList.remove('active');
    memorialPage.classList.add('active');

    // Scroll al inicio
    window.scrollTo(0, 0);
}

// Event Listeners
verifyBtn.addEventListener('click', verifyAnswers);

// Inicialización
generateQuestions();
checkLockout();
