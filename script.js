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
    //const email = document.getElementById('email').value.trim();
    const deadline = document.getElementById('deadline').value;
    //const personInCharge = document.getElementById('person-in-charge').value.trim();

    if (title === '' || details === '' || dateTime === '' || section === '' || deadline === '') {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const newTask = { section, title, details, dateTime, email, deadline, personInCharge, status: 'Pendiente' };
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
    document.getElementById('email').value = task.email;
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
        <td>${task.dateTime}</td>
        <td>${task.status}</td>
        <td>${task.details}</td>
        <td>${task.email}</td>
        <td>${task.deadline}</td>
        <td>${task.personInCharge}</td>
        <td><input type="checkbox" class="complete-task"></td>
        <td><input type="checkbox" class="select-task"></td>
      `;
      row.querySelector('.complete-task').addEventListener('click', () => completeTask(index));
      row.querySelector('.select-task').addEventListener('click', () => selectTask(row));
      taskTable.appendChild(row);
    });
  }

  function renderHistory(filteredHistory = history) {
    historyTable.innerHTML = '';
    filteredHistory.forEach((task, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${task.section}</td>
        <td>${task.title}</td>
        <td>${task.status}</td>
        <td>${task.dateTime}</td>
        <td>${task.details}</td>
        <td>${task.email}</td>
        <td>${task.deadline}</td>
        <td>${task.personInCharge}</td>
      `;
      historyTable.appendChild(row);
    });
  }

  function completeTask(taskIndex) {
    const task = tasks[taskIndex];
    task.status = 'Completado';
    history.push(task);
    tasks.splice(taskIndex, 1);
    renderTasks();
    renderHistory();
    sendCompletionEmail(task);
  }

  function selectTask(row) {
    row.classList.toggle('selected');
  }

  function sendCompletionEmail(task) {
    // colocar el servicio de correo electrónico
    console.log(`Enviando correo a ${task.email} sobre la tarea completada: ${task.title}`);
  }

  // Encriptar el correo electrónico
function encryptEmail(email) {
  const secretKey = 'R@mH.259943**'; // Reemplaza esto con una clave segura
  return CryptoJS.AES.encrypt(email, secretKey).toString();
}

// Desencriptar el correo electrónico
function decryptEmail(encryptedEmail) {
  const secretKey = 'R@mH.259943**'; // Reemplaza esto con la misma clave
  const bytes = CryptoJS.AES.decrypt(encryptedEmail, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Ejemplo de uso
const email = 'example@example.com';
const encryptedEmail = encryptEmail(email);
console.log('Encrypted Email:', encryptedEmail);
const decryptedEmail = decryptEmail(encryptedEmail);
console.log('Decrypted Email:', decryptedEmail);


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyDb7448QL73qBrC_YdNiXMGYD0QZH-i7-c",
  authDomain: "taskmaster-f650b.firebaseapp.com",
  projectId: "taskmaster-f650b",
  storageBucket: "taskmaster-f650b.appspot.com",
  messagingSenderId: "196468952105",
  appId: "1:196468952105:web:c71cb539331e3e8f882038",
  measurementId: "G-LH8HFCBJ75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// main.js
import { app, analytics } from './firebaseConfig.js';
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; 

const db = getFirestore(app);

// Example of adding data to Firestore
async function addTask() {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      title: "My first task",
      description: "This is a description of my first task.",
      completed: false
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

// Example of reading data from Firestore
async function getTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data()}`);
  });
}

// Call functions to test
addTask();
getTasks();

  
  // Renderizamos las tareas y el historial al cargar la página
  renderTasks();
  renderHistory();
  setDefaultDateTime();
  clearFields();
});
