//import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import CryptoJS from 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';

document.addEventListener('DOMContentLoaded', function() {
  // Firebase configuration
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

    const encryptedEmail = email ? encryptEmail(email) : ''; // Encriptar el correo si está presente
    const newTask = { section, title, details, dateTime, email: encryptedEmail, deadline, personInCharge, status: 'Pendiente' };

    db.collection('tasks').add(newTask)
      .then(() => {
        tasks.push(newTask);
        renderTasks();
        clearFields();
        if (email) {
          sendEmailNotification(email, newTask); // Enviar correo si se proporciona
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
      alert('Por favor, seleccione una o más tareas para eliminar.');
      return;
    }

    selectedTasks.forEach(taskRow => {
      const taskIndex = taskRow.getAttribute('data-index');
      const task = tasks[taskIndex];
      db.collection('tasks').doc(task.id).delete()
        .then(() => {
          tasks.splice(taskIndex, 1);
          renderTasks();
        })
        .catch(error => {
          console.error("Error removing task: ", error);
        });
    });
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
        <td>${task.email ? showPartialEmail(task.email) : ''}</td>
        <td>${task.deadline}</td>
        <td>${task.personInCharge}</td>
        <td>${task.status}</td>
        <td><input type="checkbox" onclick="toggleTaskStatus(${index})"></td>
        <td><input type="radio" name="select-task" onclick="selectTask(${index})"></td>
      `;
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
        <td>${task.details}</td>
        <td>${task.dateTime}</td>
        <td>${task.email ? showPartialEmail(task.email) : ''}</td>
        <td>${task.deadline}</td>
        <td>${task.personInCharge}</td>
        <td>${task.status}</td>
      `;
      historyTable.appendChild(row);
    });
  }

  function encryptEmail(email) {
    return CryptoJS.AES.encrypt(email, 'secret key 123').toString();
  }

  function decryptEmail(encryptedEmail) {
    const bytes = CryptoJS.AES.decrypt(encryptedEmail, 'secret key 123');
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  function showPartialEmail(encryptedEmail) {
    const email = decryptEmail(encryptedEmail);
    const atIndex = email.indexOf('@');
    return email.slice(0, atIndex) + '*****';
  }

  //function sendEmailNotification(email, task) {
    // Aquí debes implementar el envío de correo electrónico con tu servicio de correo preferido.
    // Ejemplo utilizando EmailJS:
    // emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    //   to_email: email,
    //   title: task.title,
    //  

 //details: task.details,
    //   start_date: task.dateTime,
    //   deadline: task.deadline
    // });
 // }

  let tasks = [];
  let history = [];

  db.collection('tasks').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      tasks.push({ ...doc.data(), id: doc.id });
    });
    renderTasks();
  });

  setDefaultDateTime();
});
