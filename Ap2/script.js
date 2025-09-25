// --- 1. Configurações da API ---
const ALPHA_VANTAGE_API_KEY = 'NUXJOWTHMI1L4ZR4'; 

// --- 2. Definição das Perguntas do Questionário ---
const questions = [
    {
        question: "Qual seria sua reação se o valor de seus investimentos caísse 20% em um mês?",
        options: [
            { text: "Entraria em pânico e venderia tudo.", score: 1 }, // Seguro
            { text: "Ficaria preocupado, mas esperaria a recuperação.", score: 2 }, // Moderado
            { text: "Veria como uma oportunidade para comprar mais.", score: 3 }  // Alto Risco
        ]
    },
    {
        question: "Por quanto tempo você pretende manter seus investimentos?",
        options: [
            { text: "Menos de 1 ano.", score: 1 },
            { text: "De 1 a 5 anos.", score: 2 },
            { text: "Mais de 5 anos.", score: 3 }
        ]
    },
    {
        question: "Qual é o seu nível de conhecimento sobre investimentos?",
        options: [
            { text: "Nenhum ou muito básico.", score: 1 },
            { text: "Intermediário (Já investiu em Renda Fixa / Ações).", score: 2 },
            { text: "Avançado (acompanho o mercado e diversifica bem seus ativos).", score: 3 }
        ]
    },
    {
        question: "Qual é o seu principal objetivo ao investir?",
        options: [
            { text: "Preservar capital.", score: 1 },
            { text: "Obter uma renda estável.", score: 2 },
            { text: "Aumentar o patrimônio no longo prazo.", score: 3 }
        ]
    },
    {
        question: "Você já possui uma reserva de emergência equivalente a pelo menos 6 meses de despesas?",
        options: [
            { text: "Não.", score: 1 },
            { text: "Parcialmente.", score: 2 },
            { text: "Sim.", score: 3 }
        ]
    },
    {
        question: "Qual é a sua principal fonte de renda atualmente?",
        options: [
            { text: "Apenas salário ou aposentadoria.", score: 1 },
            { text: "Salário + rendimentos extras (Aluguéis, freelas, etc).", score: 2 },
            { text: "Renda passiva ou diversificada.", score: 3 }
        ]
    },
    {
        question: "Quanto do seu patrimônio você está disposto a arriscar em investimentos de maior risco?",
        options: [
            { text: "Menos de 10%.", score: 1 },
            { text: "Entre 10% e 30%.", score: 2 },
            { text: "Mais de 30%.", score: 3 }
        ]
    },
];

// Sugestões de investimentos
const investmentSuggestions = {
    Conservador: ['ITUB4.SA', 'BBDC4.SA', 'BBAS3.SA'], // Bancos, mais estáveis
    Moderado: ['PETR4.SA', 'VALE3.SA', 'WEGE3.SA'], // Petróleo, mineração, indústria (variável)
    Arrojado: ['MGLU3.SA', 'IRBR3.SA', 'CVCB3.SA'] // Empresas com maior volatilidade/potencial de crescimento
};

// ...existing code...

// --- 3. Variáveis de Estado do Quiz ---
let currentQuestionIndex = 0;
let totalScore = 0;
const userAnswers = []; // Para armazenar as respostas selecionadas

// --- 4. Elementos da Interface ---
const quizContainer = document.getElementById("quiz-container");
const currentQuestionEl = document.getElementById("current-question");
const optionsContainer = document.getElementById("options-container");
const nextQuestionBtn = document.getElementById("next-question-btn");
const calculateProfileBtn = document.getElementById("calculate-profile-btn");
const resultContainer = document.getElementById("result-container");
const profileResultEl = document.getElementById("profileResult");
const investmentRecommendationEl = document.getElementById("investmentRecommendation");
const investmentSuggestionsDiv = document.getElementById("investment-suggestions");

// --- 5. Funções do Quiz ---

/**
 * Renderiza a pergunta atual na interface.
 */
function renderCurrentQuestion() {
    // Limpa containers
    currentQuestionEl.innerHTML = '';
    optionsContainer.innerHTML = '';
    nextQuestionBtn.style.display = 'none'; // Esconde o botão "Próxima" até uma opção ser selecionada

    if (currentQuestionIndex < questions.length) {
        const q = questions[currentQuestionIndex];
        currentQuestionEl.innerHTML = `<h3>${q.question}</h3>`;

        q.options.forEach((option, oIndex) => {
            const inputId = `q${currentQuestionIndex}-option${oIndex}`;
            const optionItemDiv = document.createElement('div');
            optionItemDiv.classList.add('option-item');

            optionItemDiv.innerHTML = `
                <input type="radio" id="${inputId}" name="current_question" value="${option.score}" data-text="${option.text}" required>
                <label for="${inputId}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionItemDiv);
        });

        // Adiciona event listener para as opções de rádio
        optionsContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                nextQuestionBtn.style.display = 'block'; // Mostra o botão "Próxima Pergunta"
                if (currentQuestionIndex === questions.length - 1) {
                    nextQuestionBtn.style.display = 'none'; // Esconde o botão "Próxima" na última pergunta
                    calculateProfileBtn.style.display = 'block'; // Mostra o botão "Descobrir Perfil"
                }
            });
        });

    } else {
        // Todas as perguntas foram respondidas, esconde o quiz e mostra o botão final
        quizContainer.style.display = 'none';
        calculateProfileBtn.style.display = 'block';
    }
}

/**
 * Avança para a próxima pergunta ou finaliza o quiz.
 */
function goToNextQuestion() {
    const selectedOption = optionsContainer.querySelector('input[name="current_question"]:checked');

    if (!selectedOption) {
        alert("Por favor, selecione uma resposta para continuar!");
        return;
    }

    // Adiciona a pontuação da resposta atual
    totalScore += parseInt(selectedOption.value);
    userAnswers.push({
        questionIndex: currentQuestionIndex,
        score: parseInt(selectedOption.value),
        text: selectedOption.dataset.text // Armazena o texto da resposta também
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        renderCurrentQuestion();
    } else {
        // Fim das perguntas, prepara para calcular o perfil
        quizContainer.style.display = 'none';
        calculateProfileBtn.style.display = 'block';
    }
}

/**
 * Calcula e exibe o perfil do investidor com base no score total.
 * @param {number} score - O score total do usuário.
 */
function displayProfile(score) {
    let profile = "";
    let investmentRecommendation = "";
    let suggestedTickers = [];

    // Adapte as faixas de score conforme a sua necessidade e número de perguntas
    // Com 7 perguntas e 3 opções (1 a 3 pontos por pergunta):
    // Score Mínimo: 7 * 1 = 7
    // Score Máximo: 7 * 3 = 21

    if (score >= 7 && score <= 11) { // Conservador (Ex: 7-11)
        profile = "Conservador";
        investmentRecommendation = "Seu perfil é - Conservador -.<br>Você busca segurança e estabilidade, preferindo investimentos de baixo risco que preservem seu capital. Sugerimos focar em renda fixa, CDBs e Tesouro Direto.";
        suggestedTickers = investmentSuggestions.Conservador;
    } else if (score > 11 && score <= 16) { // Moderado (Ex: 12-16)
        profile = "Moderado";
        investmentRecommendation = "Seu perfil é - Moderado -.<br>Você aceita um pouco mais de risco para buscar retornos maiores, mas ainda valoriza a segurança. Uma carteira diversificada com renda fixa e uma parcela em renda variável (como fundos imobiliários e ações de baixo risco) pode ser interessante.";
        suggestedTickers = investmentSuggestions.Moderado;
    } else if (score > 16 && score <= 21) { // Arrojado (Ex: 17-21)
        profile = "Arrojado";
        investmentRecommendation = "Seu perfil é - Arrojado -.<br>Você tem um apetite maior por risco e busca maximizar os retornos no longo prazo. Pode considerar investimentos em ações de empresas com alto potencial de crescimento, fundos de ações e, se bem informado, criptoativos.";
        suggestedTickers = investmentSuggestions.Arrojado;
    } else {
        profile = "Indefinido";
        investmentRecommendation = "Não foi possível definir seu perfil com as respostas. Por favor, revise suas escolhas ou entre em contato para uma análise mais profunda.";
        suggestedTickers = []; // Nenhuma sugestão se o perfil for indefinido
    }

    // Exiba o perfil e a recomendação na sua interface
    profileResultEl.innerHTML = `Seu perfil de investidor é: <strong>${profile}</strong>.`;
    investmentRecommendationEl.innerHTML = investmentRecommendation;

    // Esconde o quiz e mostra o resultado
    document.body.classList.add('quiz-finished'); // Adiciona classe para controlar a exibição via CSS
    resultContainer.style.display = 'block'; // Garante que o container de resultado esteja visível

    // Variações diárias
    if (suggestedTickers.length > 0) {
        fetchDailyChanges(suggestedTickers, profile);
    } else {
        investmentSuggestionsDiv.innerHTML = '<p>Nenhuma sugestão de investimento específica para este perfil no momento.</p>';
    }
}

// --- 6. Integração com Alpha Vantage ---

/**
 * Busca a variação diária na API Alpha Vantage.
 * @param {string} ticker - O símbolo do ativo (ex: 'PETR4.SA').
 * @returns {Promise<number|null>} A variação percentual diária ou null em caso de erro.
 */
async function getDailyChange(ticker) {
    // Usamos TIME_SERIES_DAILY para pegar o histórico diário
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar ${ticker}: ${response.status}`);
        }
        const data = await response.json();

        // Verifica se há dados da série temporal diária
        const dailyData = data['Time Series (Daily)'];
        if (dailyData) {
            const dates = Object.keys(dailyData).sort().reverse(); // Pega as datas e ordena do mais recente
            if (dates.length >= 2) {
                const latestDate = dates[0];
                const previousDate = dates[1];

                const latestClose = parseFloat(dailyData[latestDate]['4. close']);
                const previousClose = parseFloat(dailyData[previousDate]['4. close']);

                if (!isNaN(latestClose) && !isNaN(previousClose) && previousClose !== 0) {
                    const change = ((latestClose - previousClose) / previousClose) * 100;
                    return change; // Retorna a variação percentual
                }
            }
        }
        console.warn(`Dados incompletos ou inválidos para ${ticker}:`, data);
        return null;
    } catch (error) {
        console.error(`Erro ao obter variação diária para ${ticker}:`, error);
        return null;
    }
}

/**
 * Busca as variações diárias para uma lista de tickers e as exibe.
 * @param {string[]} tickers - Array de símbolos de ativos.
 * @param {string} profile - O perfil do investidor.
 */
async function fetchDailyChanges(tickers, profile) {
    investmentSuggestionsDiv.innerHTML = '<h3>Sugestões de Investimento:</h3><p>Buscando dados de mercado...</p>'; // Mensagem de carregamento

    const bubbleHtmls = await Promise.all(tickers.map(async (ticker) => {
        const change = await getDailyChange(ticker);
        let changeText = 'N/A';
        let changeClass = '';

        if (change !== null) {
            changeText = `${change.toFixed(2)}%`;
            if (change > 0) {
                changeClass = 'positive';
                changeText = `+${changeText}`; // Adiciona '+' para valores positivos
            } else if (change < 0) {
                changeClass = 'negative';
            }
        }

        // Remover o ".SA" para exibir o nome do ticker de forma mais limpa
        const displayTicker = ticker.replace('.SA', '');

        return `
            <div class="investment-bubble">
                <strong>${displayTicker}</strong>
                <span class="daily-change ${changeClass}">${changeText}</span>
            </div>
        `;
    }));

    investmentSuggestionsDiv.innerHTML = '<h3>Sugestões de Investimento:</h3>' + bubbleHtmls.join('');
}

// ---8. AS 26/06/25 ---

// Criando funcao para manipular Input
    const suggestionsList = document.getElementById('suggestionsList');
    // Função para renderizar todos os produtos na lista
    function renderizarLista() {
      suggestionsList.innerHTML = '';
      Object.entries(investmentSuggestions).forEach(([perfil, acoes]) => {
        acoes.forEach(nome => {
          const li = document.createElement('li');
          li.className = 'suggestion';
          li.textContent = `${nome} (${perfil})`;
          suggestionsList.appendChild(li);
        });
      });
    }
    renderizarLista();
    
// --- 7. Inicialização e Event Listeners ---

// Quando a página carregar, renderiza a primeira pergunta
// ... (seu código JavaScript existente, antes do window.onload) ...

window.onload = () => {
    renderCurrentQuestion();
    nextQuestionBtn.addEventListener('click', goToNextQuestion);
    calculateProfileBtn.addEventListener('click', () => displayProfile(totalScore));

    const backgroundMusic = document.getElementById('background-music');
    const toggleMusicBtn = document.getElementById('toggle-music-btn');

    // --- MUDANÇA AQUI: REMOVEMOS O backgroundMusic.play() INICIAL ---
    // A música já está mutada pelo atributo 'muted' na tag HTML.
    // Ela só será reproduzida (com som) após a interação do usuário.
    backgroundMusic.volume = 0.3; // Define um volume mais baixo (opcional)

    let isMuted = true; // Estado inicial da música (começa mutada)

    toggleMusicBtn.addEventListener('click', () => {
        if (isMuted) {
            // Se estava mutada, vamos desmutar E iniciar a reprodução
            backgroundMusic.muted = false;
            backgroundMusic.play().catch(e => {
                console.error("Erro ao tentar tocar música após interação:", e);
                // Pode adicionar um feedback visual aqui se a reprodução ainda falhar
            });
            toggleMusicBtn.innerText = "Desativar Música";
        } else {
            // Se estava tocando, vamos mutar
            backgroundMusic.muted = true;
            // Opcional: Se quiser pausar completamente em vez de apenas mutar:
            // backgroundMusic.pause();
            toggleMusicBtn.innerText = "Ativar Música";
        }
        isMuted = !isMuted; // Inverte o estado
    });
};