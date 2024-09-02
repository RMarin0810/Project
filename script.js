// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDb7448QL73qBrC_YdNiXMGYD0QZH-i7-c",
  authDomain: "taskmaster-f650b.firebaseapp.com",
  projectId: "taskmaster-f650b",
  storageBucket: "taskmaster-f650b.appspot.com",
  messagingSenderId: "196468952105",
  appId: "1:196468952105:web:c71cb539331e3e8f882038"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Añadir Tarea
document.getElementById('add-task').addEventListener('click', async () => {
  const section = document.getElementById('section').value;
  const title = document.getElementById('title').value;
  const details = document.getElementById('details').value;
  const dateTime = document.getElementById('date-time').value;
  const deadline = document.getElementById('deadline').value;

  if (title.trim() === '' || details.trim() === '' || dateTime === '' || deadline === '') {
    alert('Por favor, complete todos los campos.');
    return;
  }

  await db.collection('tasks').add({
    section,
    title,
    details,
    dateTime,
    deadline,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('task-form').reset();
  loadTasks();
});

// Cargar Tareas
const loadTasks = async () => {
  const tasksTable = document.getElementById('tasks-table').getElementsByTagName('tbody')[0];
  tasksTable.innerHTML = '';

  const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
  snapshot.forEach(doc => {
    const task = doc.data();
    const row = tasksTable.insertRow();
    row.innerHTML = `
      <td>${task.section}</td>
      <td>${task.title}</td>
      <td>${task.details}</td>
      <td>${task.dateTime}</td>
      <td>${task.deadline}</td>
      <td><button class="delete" data-id="${doc.id}">Eliminar</button></td>
    `;
  });

  // Añadir evento de eliminar a los botones
  document.querySelectorAll('.delete').forEach(button => {
    button.addEventListener('click', async (e) => {
      const taskId = e.target.getAttribute('data-id');
      await db.collection('tasks').doc(taskId).delete();
      loadTasks();
    });
  });
};

// Cargar las tareas cuando la página se carga
window.onload = loadTasks;
