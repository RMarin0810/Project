import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import CryptoJS from 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';

const firebaseConfig = {
  apiKey: "AIzaSyDb7448QL73qBrC_YdNiXMGYD0QZH-i7-c",
  authDomain: "taskmaster-f650b.firebaseapp.com",
  projectId: "taskmaster-f650b",
  storageBucket: "taskmaster-f650b.appspot.com",
  messagingSenderId: "196468952105",
  appId: "1:196468952105:web:c71cb539331e3e8f882038",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => {
    console.log("Sesión anónima iniciada");
  })
  .catch((error) => {
    console.error("Error al iniciar sesión anónima:", error);
  });

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

function encryptEmail(email) {
  return CryptoJS.AES.encrypt(email, 'secret-key').toString();
}

function decryptEmail(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, 'secret-key');
  return bytes.toString(CryptoJS.enc.Utf8);
}

function partiallyHideEmail(email) {
  const [name, domain] = email.split('@');
  const hiddenPart = '*'.repeat(domain.length - 2);
  return `${name[0]}${hiddenPart}@${domain}`;
}

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
  };

  try {
    await addDoc(collection(db, 'tasks'), task);
    loadTasks();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});

document.getElementById('edit-task').addEventListener('click', async () => {
  if (!selectedTaskId) return;

  const taskRef = doc(db, 'tasks', selectedTaskId);

  const updatedTask = {
    title: titleInput.value,
    details: detailsInput.value,
    dateTime: dateTimeInput.value,
    personInCharge: personInChargeInput.value,
    email: encryptEmail(emailInput.value),
    deadline: deadlineInput.value,
    section: sectionSelect.value,
  };

  try {
    await updateDoc(taskRef, updatedTask);
    loadTasks();
  } catch (error) {
    console.error("Error updating document: ", error);
  }

  selectedTaskId = null;
});

document.getElementById('delete-task').addEventListener('click', async () => {
  if (!selectedTaskId) return;

  try {
    await deleteDoc(doc(db, 'tasks', selectedTaskId));
    loadTasks();
  } catch (error) {
    console.error("Error removing document: ", error);
  }

  selectedTaskId = null;
});

async function loadTasks() {
  tasksTable.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'tasks'));

  querySnapshot.forEach((doc) => {
    const task = doc.data();
    const row = tasksTable.insertRow();
    row.insertCell(0).innerText = task.section;
    row.insertCell(1).innerText = task.title;
    row.insertCell(2).innerText = task.dateTime;
    row.insertCell(3).innerText = task.completed ? 'Completada' : 'Pendiente';
    row.insertCell(4).innerText = task.details;
    row.insertCell(5).innerText = partiallyHideEmail(decryptEmail(task.email));
    row.insertCell(6).innerText = task.deadline;
    row.insertCell(7).innerText = task.personInCharge;

    const completeButton = document.createElement('button');
    completeButton.innerText = 'Completar';
    completeButton.addEventListener('click', async () => {
      await updateDoc(doc(db, 'tasks', doc.id), { completed: true });
      loadTasks();
      loadHistory();
    });

    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.addEventListener('click', () => {
      selectedTaskId = doc.id;
      titleInput.value = task.title;
      detailsInput.value = task.details;
      dateTimeInput.value = task.dateTime;
      personInChargeInput.value = task.personInCharge;
      emailInput.value = decryptEmail(task.email);
      deadlineInput.value = task.deadline;
      sectionSelect.value = task.section;
    });

    row.insertCell(8).appendChild(completeButton);
    row.insertCell(9).appendChild(editButton);
  });
}

async function loadHistory() {
  historyTable.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'tasks'));

  querySnapshot.forEach((doc) => {
    const task = doc.data();
    if (task.completed) {
      const row = historyTable.insertRow();
      row.insertCell(0).innerText = task.section;
      row.insertCell(1).innerText = task.title;
      row.insertCell(2).innerText = task.dateTime;
      row.insertCell(3).innerText = 'Completada';
      row.insertCell(4).innerText = task.details;
      row.insertCell(5).innerText = partiallyHideEmail(decryptEmail(task.email));
      row.insertCell(6).innerText = task.deadline;
      row.insertCell(7).innerText = task.personInCharge;
    }
  });
}

document.getElementById('filter-section').addEventListener('change', async () => {
  const section = filterSectionSelect.value;

  tasksTable.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'tasks'));

  querySnapshot.forEach((doc) => {
    const task = doc.data();
    if (!section || task.section === section) {
      const row = tasksTable.insertRow();
      row.insertCell(0).innerText = task.section;
      row.insertCell(1).innerText = task.title;
      row.insertCell(2).innerText = task.dateTime;
      row.insertCell(3).innerText = task.completed ? 'Completada' : 'Pendiente';
      row.insertCell(4).innerText = task.details;
      row.insertCell(5).innerText = partiallyHideEmail(decryptEmail(task.email));
      row.insertCell(6).innerText = task.deadline;
      row.insertCell(7).innerText = task.personInCharge;

      const completeButton = document.createElement('button');
      completeButton.innerText = 'Completar';
      completeButton.addEventListener('click', async () => {
        await updateDoc(doc(db, 'tasks', doc.id), { completed: true });
        loadTasks();
        loadHistory();
      });

      const editButton = document.createElement('button');
      editButton.innerText = 'Editar';
      editButton.addEventListener('click', () => {
        selectedTaskId = doc.id;
        titleInput.value = task.title;
        detailsInput.value = task.details;
        dateTimeInput.value = task.dateTime;
        personInChargeInput.value = task.personInCharge;
        emailInput.value = decryptEmail(task.email);
        deadlineInput.value = task.deadline;
        sectionSelect.value = task.section;
      });

      row.insertCell(8).appendChild(completeButton);
      row.insertCell(9).appendChild(editButton);
    }
  });
});

document.getElementById('search-button').addEventListener('click', async () => {
  const searchTerm = searchInput.value.toLowerCase();

  historyTable.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'tasks'));

  querySnapshot.forEach((doc) => {
    const task = doc.data();
    if (task.completed) {
      const taskDetails = `${task.section} ${task.title} ${task.details} ${decryptEmail(task.email)} ${task.personInCharge}`.toLowerCase();
      if (taskDetails.includes(searchTerm)) {
        const row = historyTable.insertRow();
        row.insertCell(0).innerText = task.section;
        row.insertCell(1).innerText = task.title;
        row.insertCell(2).innerText = task.dateTime;
        row.insertCell(3).innerText = 'Completada';
        row.insertCell(4).innerText = task.details;
        row.insertCell(5).innerText = partiallyHideEmail(decryptEmail(task.email));
        row.insertCell(6).innerText = task.deadline;
        row.insertCell(7).innerText = task.personInCharge;
      }
    }
  });
});

document.getElementById('clear-history').addEventListener('click', async () => {
  historyTable.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'tasks'));

  querySnapshot.forEach(async (doc) => {
    const task = doc.data();
    if (task.completed) {
      await deleteDoc(doc(db, 'tasks', doc.id));
    }
  });

  loadHistory();
});

tasksTable.addEventListener('click', (event) => {
  const row = event.target.closest('tr');
  selectedTaskId = row.getAttribute('data-id');
  titleInput.value = row.cells[1].innerText;
  detailsInput.value = row.cells[4].innerText;
  dateTimeInput.value = row.cells[2].innerText;
  personInChargeInput.value = row.cells[7].innerText;
  emailInput.value = row.cells[5].innerText.replace('***', '');
  deadlineInput.value = row.cells[6].innerText;
  sectionSelect.value = row.cells[0].innerText;
});

// Cargar tareas iniciales
loadTasks();
loadHistory();
