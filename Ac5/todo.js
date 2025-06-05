const tasklist = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const addTaskButton = document.getElementById('add-task-button');

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    // 1. Validação do campo de texto da tarefa
    if (taskText === '') {
        Swal.fire({
            icon: "error",
            title: "Ops!",
            text: "Por favor, digite algo antes de adicionar à lista!",
        });
        return; // Sai da função se o campo estiver vazio
    }

    // 2. Confirmação de adição da tarefa
    Swal.fire({
        title: "Confirmar adição?",
        text: `Você deseja adicionar "${taskText}" à sua lista?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, adicionar!",
        cancelButtonText: "Não, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // AQUI DENTRO É ONDE A TAREFA DEVE SER CRIADA E ADICIONADA
            // 3. Validação do campo de data (só ocorre se a tarefa foi confirmada)
            if (dueDate === '') {
                Swal.fire({
                    icon: "warning", // Mudei para warning, pois não é um erro fatal
                    title: "Atenção!",
                    text: "Você não selecionou uma data. Deseja adicionar sem data de conclusão?",
                    showCancelButton: true,
                    confirmButtonText: "Sim, adicionar sem data",
                    cancelButtonText: "Não, quero adicionar uma data",
                }).then((dateConfirmResult) => {
                    if (dateConfirmResult.isConfirmed) {
                        createAndAppendTask(taskText, dueDate);
                    } else {
                        // O usuário escolheu adicionar uma data, então não faz nada aqui,
                        // ele terá que clicar em adicionar novamente após selecionar a data.
                    }
                });
            } else {
                // Se tem data, cria e adiciona a tarefa diretamente
                createAndAppendTask(taskText, dueDate);
            }
        } else {
            // O usuário cancelou a adição da tarefa
            Swal.fire({
                title: "Cancelado!",
                text: "A adição da tarefa foi cancelada.",
                icon: "info"
            });
        }
    });
}

// Nova função para criar e adicionar a tarefa (melhora a organização)
function createAndAppendTask(taskText, dueDate) {
    const taskItem = document.createElement('li');
    taskItem.style.display = 'flex';
    taskItem.style.alignItems = 'center';
    taskItem.style.margin = '10px';
    taskItem.style.padding = '10px';
    taskItem.style.border = '5px solid #ccc';
    taskItem.style.borderRadius = '5px';
    taskItem.style.maxWidth = '400px';
    taskItem.style.backgroundColor = '#5926ea';
    taskItem.style.color = '#fff';

    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = taskText;
    taskTextSpan.style.flexGrow = '1';
    taskItem.appendChild(taskTextSpan);

    if (dueDate) {
        const dueDateSpan = document.createElement('span');
        const dateObj = new Date(dueDate + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
        dueDateSpan.textContent = ` (Concluir até: ${dateObj.toLocaleDateString('pt-BR')})`;
        dueDateSpan.style.fontSize = '0.8em';
        dueDateSpan.style.marginLeft = '10px';
        taskItem.appendChild(dueDateSpan);
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Deletar'; // Mudei para português
    deleteButton.style.marginLeft = '10px';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.backgroundColor = '#ff0000';
    deleteButton.style.color = '#fff';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '5px';
    deleteButton.onclick = function() {
        // Confirmação antes de deletar
        Swal.fire({
            title: "Tem certeza?",
            text: "Você não poderá reverter esta ação!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim, deletar!"
        }).then((result) => {
            if (result.isConfirmed) {
                tasklist.removeChild(taskItem);
                Swal.fire(
                    "Deletado!",
                    "Sua tarefa foi deletada.",
                    "success"
                );
            }
        });
    };

    taskItem.appendChild(deleteButton);
    tasklist.appendChild(taskItem);

    // Limpa os campos após adicionar
    taskInput.value = '';
    dueDateInput.value = '';

    Swal.fire({
        title: "Adicionado!",
        text: `"${taskText}" foi adicionado com sucesso à sua lista.`,
        icon: "success"
    });
}

// Event Listeners
addTaskButton.onclick = addTask;

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask(); // Chama a função diretamente
    }
});

dueDateInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask(); // Chama a função diretamente
    }
});