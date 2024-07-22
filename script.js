document.addEventListener('DOMContentLoaded', function() {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let history = JSON.parse(localStorage.getItem('history')) || [];
  const taskTable = document.getElementById('tasks-table').querySelector('tbody');
  const historyTable = document.getElementById('history-table').querySelector('tbody');

  document.getElementById('add-task').addEventListener('click', addTask);
  document.getElementById('edit-task').addEventListener('click', editTask);
  document.getElementById('delete-task').addEventListener('click', deleteTask);
  document.getElementById('search-button').addEventListener('click', searchHistory);
  document.getElementById('clear-history').addEventListener('click', clearHistory);
  document.getElementById('filter-section').addEventListener('change', filterTasks);

  window.addEventListener('beforeunload', saveData);

  function setDefaultDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    document.getElementById('date-time').value = localDateTime;
    document.getElementById('deadline').value = localDateTime;
  }

  function clearFields() {
    document.getElementById('title').value = '';
    document.getElementById('details').value = '';
    document.getElementById('date-time').value = '';
    document.getElementById('person-in-charge').value = '';
    document.getElementById('email').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('section').value = 'Agenda ISJUP';
    setDefaultDateTime();
  }

  function addTask() {
    const title = document.getElementById('title').value.trim();
    const details = document.getElementById('details').value.trim();
    const dateTime = document.getElementById('date-time').value;
    const section = document.getElementById('section').value;
    const email = document.getElementById('email').value.trim();
    const deadline = document.getElementById('deadline').value;
    const personInCharge = document.getElementById('person-in-charge').value.trim();

    if (title === '' || details === '' || dateTime === '' || section === '' || deadline === '') {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const encryptedEmail = encryptEmail(email); // Encriptar el correo
    const newTask = { section, title, details, dateTime, email: encryptedEmail, deadline, personInCharge, status: 'Pendiente' };
    tasks.push(newTask);
    renderTasks();
    clearFields();
  }

  function editTask() {
    const selectedTasks = document.querySelectorAll('tr.selected');
    if (selectedTasks.length !== 1) {
      alert('Por favor, seleccione una única tarea para editar.');
      return;
    }

    const taskIndex = selectedTasks[0].getAttribute('data-index');
    const task = tasks[taskIndex];

    document.getElementById('section').value = task.section;
    document.getElementById('title').value = task.title;
    document.getElementById('details').value = task.details;
    document.getElementById('date-time').value = task.dateTime;
    document.getElementById('email').value = decryptEmail(task.email);
    document.getElementById('deadline').value = task.deadline;
    document.getElementById('person-in-charge').value = task.personInCharge;

    tasks.splice(taskIndex, 1);
    renderTasks();
  }

  function deleteTask() {
    const selectedTasks = document.querySelectorAll('tr.selected');
    if (selectedTasks.length === 0) {
      alert('Por favor, seleccione una o más tareas para eliminar.');
      return;
    }

    selectedTasks.forEach(taskRow => {
      const taskIndex = taskRow.getAttribute('data-index');
      tasks.splice(taskIndex, 1);
    });
    renderTasks();
  }

  function searchHistory() {
    const searchQuery = document.getElementById('search').value.trim().toLowerCase();
    if (searchQuery === '') {
      renderHistory();
      return;
    }

    const filteredHistory = history.filter(task =>
      task.title.toLowerCase().includes(searchQuery) ||
      task.details.toLowerCase().includes(searchQuery) ||
      task.section.toLowerCase().includes(searchQuery)
    );
    renderHistory(filteredHistory);
  }

  function clearHistory() {
    if (confirm('¿Está seguro de que desea borrar todo el historial?')) {
      history = [];
      renderHistory();
    }
  }

  function filterTasks() {
    const filterValue = document.getElementById('filter-section').value;
    if (filterValue === 'Todo') {
      renderTasks();
    } else {
      const filteredTasks = tasks.filter(task => task.section === filterValue);
      renderTasks(filteredTasks);
    }
  }

  function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('history', JSON.stringify(history));
  }

  function renderTasks(filteredTasks = tasks) {
    taskTable.innerHTML = '';
    filteredTasks.forEach((task, index) => {
      const row = document.createElement('tr');

                            row.setAttribute('data-index', index);
  row.innerHTML = `
    <td>${task.section}</td>
    <td>${task.title}</td>
    <td>${task.details}</td>
    <td>${task.dateTime}</td>
    <td>${task.email}</td>
    <td>${task.deadline}</td>
    <td>${task.personInCharge}</td>
    <td>${task.status}</td>
  `;
  taskTable.appendChild(row);
});

  }

function renderHistory(filteredHistory = history) {
historyTable.innerHTML = ‘’;
filteredHistory.forEach((task, index) => {
const row = document.createElement(‘tr’);
row.innerHTML = <td>${task.section}</td> <td>${task.title}</td> <td>${task.details}</td> <td>${task.dateTime}</td> <td>${task.email}</td> <td>${task.deadline}</td> <td>${task.personInCharge}</td> <td>${task.status}</td>;
historyTable.appendChild(row);
});
}

function encryptEmail(email) {
const encodedEmail = btoa(email); // Ejemplo simple de encriptación
return encodedEmail;
}

function decryptEmail(encryptedEmail) {
const decodedEmail = atob(encryptedEmail); // Ejemplo simple de desencriptación
return decodedEmail;
}

setDefaultDateTime();
renderTasks();
renderHistory();
});
