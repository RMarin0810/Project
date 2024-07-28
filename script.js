// Importar las funciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import CryptoJS from 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDb7448QL73qBrC_YdNiXMGYD0QZH-i7-c",
  authDomain: "taskmaster-f650b.firebaseapp.com",
  projectId: "taskmaster-f650b",
  storageBucket: "taskmaster-f650b.appspot.com",
  messagingSenderId: "196468952105",
  appId: "1:196468952105:web:c71cb539331e3e8f882038",
  measurementId: "G-LH8HFCBJ75"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Iniciar sesión anónima
signInAnonymously(auth)
  .then(() => {
    console.log("Sesión anónima iniciada");
  })
  .catch((error) => {
    console.error("Error al iniciar sesión anónima:", error);
  });

// Referencias a elementos del DOM
const titleInput = document.getElementById('title');
const detailsInput = document.getElementById('details');
const dateTimeInput = document.getElementById('date-time');
const personInChargeInput = document.getElementById('person-in-charge');
const emailInput = document.getElementById('email');
const deadlineInput = document.getElementById('deadline');
const sectionSelect = document.getElementById('section');
const tasksTable = document.getElementById('tasks-table').getElementsByTagName('tbody')[0];
const filterSectionSelect = document.getElementById('filter-section');
const searchInput = document.getElementById('search');
const historyTable = document.getElementById('history-table').getElementsByTagName('tbody')[0];

let selectedTaskId = null;

// Encriptar correo
function encryptEmail(email) {
  return CryptoJS.AES.encrypt(email, 'secret-key').toString();
}

// Desencriptar correo
function decryptEmail(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, 'secret-key');
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Mostrar correo parcialmente
function partiallyHideEmail(email) {
  const [name, domain] = email.split('@');
  const hiddenName = name.slice(0, 3) + '***';
  return hiddenName + '@' + domain;
}

// Añadir tarea a Firestore
async function addTask(task) {
  try {
    const docRef = await addDoc(collection(db, "tasks"), task);
    console.log("Documento escrito con ID: ", docRef.id);
  } catch (e) {
    console.error("Error al añadir el documento: ", e);
  }
}

// Editar tarea en Firestore
async function editTask(id, updatedTask) {
  try {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, updatedTask);
    console.log("Documento actualizado con ID: ", id);
  } catch (e) {
    console.error("Error al actualizar el documento: ", e);
  }
}

// Eliminar tarea de Firestore
async function deleteTask(id) {
  try {
    await deleteDoc(doc(db, "tasks", id));
    console.log("Documento eliminado con ID: ", id);
  } catch (e) {
    console.error("Error al eliminar el documento: ", e);
  }
}

// Cargar tareas desde Firestore
async function loadTasks() {
  tasksTable.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach((doc) => {
    const task = doc.data();
    const row = tasksTable.insertRow();
    row.insertCell(0).innerText = task.section;
    row.insertCell(1).innerText = task.title;
    row.insertCell(2).innerText = task.dateTime;
    row.insertCell(3).innerText = task.state;
    row.insertCell(4).innerText = task.details;
    row.insertCell(5).innerText = partiallyHideEmail(decryptEmail(task.email));
    row.insertCell(6).innerText = task.deadline;
    row.insertCell(7).innerText = task.personInCharge;
    row.insertCell(8).innerHTML = `<input type="checkbox" ${task.completed ? "checked" : ""} onclick="updateTaskStatus('${doc.id}', this.checked)">`;
    row.insertCell(9).innerHTML = `<button onclick="selectTask('${doc.id}')">Seleccionar</button>`;
  });
}

// Cargar historial de tareas desde Firestore
async function loadHistory() {
  historyTable.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "history"));
  querySnapshot.forEach((doc) => {
    const task = doc.data();
    const row = historyTable.insertRow();
    row.insertCell(0).innerText = task.section;
    row.insertCell(1).innerText = task.title;
    row.insertCell(2).innerText = task.dateTime;
    row.insertCell(3).innerText = task.state;
    row.insertCell(4).innerText = task.details;
    row.insertCell(5).innerText = partiallyHideEmail(decryptEmail(task.email));
    row.insertCell(6).innerText = task.deadline;
    row.insertCell(7).innerText = task.personInCharge;
  });
}

// Añadir tarea
document.getElementById('add-task').addEventListener('click', async () => {
  const task = {
    title: titleInput.value,
    details: detailsInput.value,
    dateTime: dateTimeInput.value,
    personInCharge: personInChargeInput.value,
    email: encryptEmail(emailInput.value),
    deadline: deadlineInput.value,
    section: sectionSelect.value,
    completed: false,
    state: "Pendiente",
  };
  await addTask(task);
  loadTasks();
});

// Editar tarea
document.getElementById('edit-task').addEventListener('click', async () => {
  if (selectedTaskId) {
    const updatedTask = {
      title: titleInput.value,
      details: detailsInput.value,
      dateTime: dateTimeInput.value,
      personInCharge: personInChargeInput.value,
      email: encryptEmail(emailInput.value),
      deadline: deadlineInput.value,
      section: sectionSelect.value,
      state: "Pendiente",
    };
    await editTask(selectedTaskId, updatedTask);
    loadTasks();
  } else {
    alert("Por favor, selecciona una tarea para editar");
  }
});

// Eliminar tarea
document.getElementById('delete-task').addEventListener('click', async () => {
  if (selectedTaskId) {
    await deleteTask(selectedTaskId);
    loadTasks();
  } else {
    alert("Por favor, selecciona una tarea para eliminar");
  }
});

// Filtrar tareas
filterSectionSelect.addEventListener('change', () => {
  const filterValue = filterSectionSelect.value;
  loadTasks(filterValue);
});

// Buscar en historial
document.getElementById('search-button').addEventListener('click', () => {
  const searchValue = searchInput.value.toLowerCase();
  const rows = historyTable.getElementsByTagName('tr');
  for (let row of rows) {
    const cells = row.getElementsByTagName('td');
    let match = false;
    for (let cell of cells) {
      if (cell.innerText.toLowerCase().includes(searchValue)) {
        match = true;
        break;
      }
    }
    row.style.display = match ? '' : 'none';
  }
});

// Limpiar historial
document.getElementById('clear-history').addEventListener('click', async () => {
  const querySnapshot = await getDocs(collection(db, "history"));
  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc(db, "history", doc.id));
  });
  loadHistory();
});

// Actualizar estado de la tarea
window.updateTaskStatus = async (id, completed) => {
  const taskRef = doc(db, "tasks", id);
  await updateDoc(taskRef, {
    completed: completed,
    state: completed ? "Completada" : "Pendiente",
  });
  loadTasks();
};

// Seleccionar tarea para editar o eliminar
window.selectTask = (id) => {
  selectedTaskId = id;
  const row = tasksTable.querySelector(`button[onclick="selectTask('${id}')"]`).parentNode.parentNode;
  titleInput.value = row.cells[1].innerText;
  detailsInput.value = row.cells[4].innerText;
  dateTimeInput.value = row.cells[2].innerText;
  personInChargeInput

.value = row.cells[7].innerText;
  emailInput.value = row.cells[5].innerText.replace('***', '');
  deadlineInput.value = row.cells[6].innerText;
  sectionSelect.value = row.cells[0].innerText;
};

// Cargar tareas iniciales
loadTasks();
loadHistory();
