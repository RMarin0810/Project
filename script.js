// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDb7448QL73qBrC_YdNiXMGYD0QZH-i7-c",
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

document.addEventListener('DOMContentLoaded', () => {
  const taskTable = document.getElementById('tasks-table').querySelector('tbody');
  const historyTable = document.getElementById('history-table').querySelector('tbody');

  document.getElementById('add-task').addEventListener('click', addTask);
  document.getElementById('edit-task').addEventListener('click', editTask);
  document.getElementById('delete-task').addEventListener('click', deleteTask);

  loadTasksFromFirestore();
  setDefaultDateTime();
});

function addTask() {
  const title = document.getElementById('title').value.trim();
  const details = document.getElementById('details').value.trim();
  const dateTime = document.getElementById('date-time').value;
  const section = document.getElementById('section').value;
  const email = document.getElementById('email').value.trim();
  const deadline = document.getElementById('deadline').value;
  const personInCharge = document.getElementById('person-in-charge').value.trim();

  if (!title || !details || !dateTime || !section || !deadline) {
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

function loadTasksFromFirestore() {
  db.collection('tasks').get().then((querySnapshot) => {
    tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push(doc.data());
    });
    renderTasks();
  }).catch((error) => {
    console.error("Error loading tasks: ", error);
  });
}

function renderTasks() {
  const taskTable = document.getElementById('tasks-table').querySelector('tbody');
  taskTable.innerHTML = '';
  tasks.forEach((task, index) => {
    const row = document.createElement('tr');
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
