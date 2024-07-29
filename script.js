// Configuración de Firebase
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "taskmaster-f650b.firebaseapp.com",
  projectId: "taskmaster-f650b",
  storageBucket: "taskmaster-f650b.appspot.com",
  messagingSenderId: "196468952105",
  appId: "1:196468952105:web:c71cb539331e3e8f882038",
  measurementId: "G-LH8HFCBJ75"
};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Funciones y variables de la aplicación
let tasks = [];
let history = [];

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
    alert('Por favor, complete todos los campos obligatorios.');
    return;
  }

  const encryptedEmail = email ? encryptEmail(email) : '';
  const newTask = { section, title, details, dateTime, email: encryptedEmail, deadline, personInCharge, status: 'Pendiente' };

  db.collection('tasks').add(newTask)
    .then(() => {
      tasks.push(newTask);
      renderTasks();
      clearFields();
      if (email) {
        sendEmailNotification(email, newTask);
      }
    })
    .catch(error => {
      console.error("Error adding task: ", error);
    });
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
    alert('Por favor, seleccione al menos una tarea para eliminar.');
    return;
  }

  selectedTasks.forEach(taskRow => {
    const taskIndex = taskRow.getAttribute('data-index');
    const task = tasks[taskIndex];

    db.collection('tasks').where("title", "==", task.title)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.ref.delete();
        });
      })
      .catch(error => {
        console.error("Error removing task: ", error);
      });

    tasks.splice(taskIndex, 1);
    history.push(task);
  });

  renderTasks();
  renderHistory();
}

function searchHistory() {
  const searchTerm = document.getElementById('search-term').value.trim().toLowerCase();
  const filteredHistory = history.filter(task => {
    return task.title.toLowerCase().includes(searchTerm) || 
           task.details.toLowerCase().includes(searchTerm) ||
           task.section.toLowerCase().includes(searchTerm);
  });
  renderHistory(filteredHistory);
}

function clearHistory() {
  history = [];
  renderHistory();
}

function filterTasks() {
  const section = document.getElementById('filter-section').value;
  const filteredTasks = section === 'Todas' ? tasks : tasks.filter(task => task.section === section);
  renderTasks(filteredTasks);
}

function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('history', JSON.stringify(history));
}

function renderTasks(taskList = tasks) {
  taskTable.innerHTML = '';
  taskList.forEach((task, index) => {
    const row = document.createElement('tr');
    row.setAttribute('data-index', index);
    row.innerHTML = `
      <td>${task.section}</td>
      <td>${task.title}</td>
      <td>${task.details}</td>
      <td>${task.dateTime}</td>
      <td>${showPartialEmail(task.email)}</td>
      <td>${task.deadline}</td>
      <td>${task.personInCharge}</td>
      <td>${task.status}</td>
      <td><button onclick="toggleTaskStatus(${index})">Completar</button></td>
      <td><button onclick="selectTask(${index})">Seleccionar</button></td>
    `;
    taskTable.appendChild(row);
  });
}

function renderHistory(historyList = history) {
  historyTable.innerHTML = '';
  historyList.forEach((task, index) => {
    const row = document.createElement('tr');
    row.setAttribute('data-index', index);
    row.innerHTML = `
      <td>${task.section}</td>
      <td>${task.title}</td>
      <td>${task.details}</td>
      <td>${task.dateTime}</td>
      <td>${showPartialEmail(task.email)}</td>
      <td>${task.deadline}</td>
      <td>${task.personInCharge}</td>
      <td>${task.status}</td>
    `;
    historyTable.appendChild(row);
  });
}

function encryptEmail(email) {
  return CryptoJS.AES.encrypt(email, 'encryption-key').toString();
}

function decryptEmail(encryptedEmail) {
  const bytes = CryptoJS.AES.decrypt(encryptedEmail, 'encryption-key');
  return bytes.toString(CryptoJS.enc.Utf8);
}

function showPartialEmail(encryptedEmail) {
  const email = decryptEmail(encryptedEmail);
  const [username, domain] = email.split('@');
  const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
}

function toggleTaskStatus(index) {
  const task = tasks[index];
  task.status = task.status === 'Pendiente' ? 'Completada' : 'Pendiente';
  renderTasks();
}

function selectTask(index) {
  const rows = document.querySelectorAll('tr');
  rows.forEach(row => row.classList.remove('selected'));
  rows[index].classList.add('selected');
}

// Cargar tareas y historial desde localStorage
document.addEventListener('DOMContentLoaded', () => {
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  history = JSON.parse(localStorage.getItem('history')) || [];
  renderTasks();
  renderHistory();
  setDefaultDateTime();
});

function sendEmailNotification(email, task) {
  // Aquí puedes implementar el envío de correos electrónicos utilizando una API de correo electrónico como EmailJS
  console.log(`Enviar notificación a ${email} sobre la tarea: ${task.title}`);
}
