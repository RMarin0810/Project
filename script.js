// Configuración de Firebase
import { firebaseConfig } from './config.js';
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
  const taskTable = document.getElementById('tasks-table').querySelector('tbody');

  document.getElementById('add-task').addEventListener('click', addTask);
  document.getElementById('edit-task').addEventListener('click', editTask);
  document.getElementById('delete-task').addEventListener('click', deleteTask);

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

    const newTask = { section, title, details, dateTime, email, deadline, personInCharge, status: 'Pendiente' };

    db.collection('tasks').add(newTask)
      .then(() => {
        loadTasks();
        clearFields();
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

    const taskId = selectedTasks[0].getAttribute('data-id');
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

    const updatedTask = { section, title, details, dateTime, email, deadline, personInCharge, status: 'Pendiente' };

    db.collection('tasks').doc(taskId).update(updatedTask)
      .then(() => {
        loadTasks();
        clearFields();
      })
      .catch(error => {
        console.error("Error editing task: ", error);
      });
  }

  function deleteTask() {
    const selectedTasks = document.querySelectorAll('tr.selected');
    if (selectedTasks.length === 0) {
      alert('Por favor, seleccione una o más tareas para eliminar.');
      return;
    }

    selectedTasks.forEach(taskRow => {
      const taskId = taskRow.getAttribute('data-id');
      db.collection('tasks').doc(taskId).delete()
        .then(() => {
          loadTasks();
        })
        .catch(error => {
          console.error("Error removing task: ", error);
        });
    });
  }

  function loadTasks() {
    db.collection('tasks').get().then(querySnapshot => {
      const tasks = [];
      querySnapshot.forEach(doc => {
        tasks.push({ ...doc.data(), id: doc.id });
      });
      renderTasks(tasks);
    });
  }

  function renderTasks(tasks) {
    taskTable.innerHTML = '';

    tasks.forEach((task, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-id', task.id);
      row.innerHTML = `
        <td>${task.section}</td>
        <td>${task.title}</td>
        <td>${task.details}</td>
        <td>${task.dateTime}</td>
        <td>${task.email}</td>
        <td>${task.deadline}</td>
        <td>${task.personInCharge}</td>
        <td>${task.status}</td>
        <td><input type="checkbox" onclick="toggleTaskStatus(${index})"></td>
        <td><input type="radio" name="select-task" onclick="selectTask(${index})"></td>
      `;
      taskTable.appendChild(row);
    });
  }

  function toggleTaskStatus(index) {
    const taskRow = document.querySelector(`tr[data-index="${index}"]`);
    const taskId = taskRow.getAttribute('data-id');
    const task = tasks[index];

    task.status = task.status === 'Pendiente' ? 'Completada' : 'Pendiente';

    db.collection('tasks').doc(taskId).update({ status: task.status })
      .then(() => {
        loadTasks();
      })
      .catch(error => {
        console.error("Error updating task status: ", error);
      });
  }

  function selectTask(index) {
    const taskRow = document.querySelector(`tr[data-index="${index}"]`);
    taskRow.classList.toggle('selected');
  }

  setDefaultDateTime();
  loadTasks();
});
