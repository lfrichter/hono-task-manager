document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '/todos';
  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');
  const emptyMessage = document.getElementById('emptyMessage');

  // Carregar tarefas ao iniciar
  async function loadTodos() {
    try {
      const res = await fetch(API_URL);
      const todos = await res.json();
      renderTodos(todos);
    } catch (err) {
      alert('Error loading tasks: ' + err.message);
    }
  }

  // Renderizar lista de tarefas
  function renderTodos(todos) {
    todoList.innerHTML = '';
    if (todos.length === 0) {
      emptyMessage.classList.remove('hidden');
    } else {
      emptyMessage.classList.add('hidden');
      todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'card flex items-center justify-between';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex items-center gap-3';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500';
        checkbox.checked = todo.done;
        checkbox.addEventListener('change', () => toggleDone(todo.id, checkbox.checked));

        const span = document.createElement('span');
        span.className = todo.done ? 'line-through text-gray-500' : 'text-white';
        span.textContent = todo.text;

        contentDiv.append(checkbox, span);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'text-red-500 hover:text-red-700 text-sm font-medium';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));

        li.append(contentDiv, deleteButton);
        todoList.appendChild(li);
      });
    }
  }

  // Função para adicionar nova tarefa
  async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return alert('Please enter a task!');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      await res.json();
      todoInput.value = '';
      loadTodos(); // Recarrega a lista
    } catch (err) {
      alert('Error adding task: ' + err.message);
    }
  }

  // Atualizar status (feito/não feito)
  async function toggleDone(id, done) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      });
      loadTodos();
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  // Deletar tarefa
  async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      loadTodos();
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  // Evento de clique no botão "Add"
  addBtn.addEventListener('click', addTodo);

  // Evento de pressionar "Enter" no campo de input
  todoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addTodo();
    }
  });

  // Script para o fundo aleatório
  const images = [
    '/images/Beautifullbeach(1).jpg',
    '/images/Beautifullbeach(2).jpg',
    '/images/Beautifullbeach(3).jpg'
  ];
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];
  document.body.style.backgroundImage = `url('${selectedImage}')`;

  // Carregar tarefas ao iniciar
  loadTodos();
});

