// Configuración de Supabase
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tsiiqfmwyjyufpnxsnps.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

let selectedTaskId = null;

async function addTaskToSupabase(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task]);

  if (error) {
    console.error("Error al agregar la tarea:", error);
  } else {
    console.log("Tarea agregada:", data);
    loadTasksFromSupabase(); // Recargar las tareas después de agregar
    clearFields();
  }
}

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
  const newTask = {
    section,
    title,
    details,
    date_time: dateTime,
    email: encryptedEmail,
    deadline,
    person_in_charge: personInCharge,
    status: 'Pendiente'
  };

  addTaskToSupabase(newTask);
}

function clearFields() {
  document.getElementById('title').value = '';
  document.getElementById('details').value = '';
  document.getElementById('date-time').value = '';
  document.getElementById('section').value = '';
  document.getElementById('email').value = '';
  document.getElementById('deadline').value = '';
  document.getElementById('person-in-charge').value = '';
  selectedTaskId = null;
  document.getElementById('edit-task').disabled = true;
  document.getElementById('delete-task').disabled = true;
}

async function loadTasksFromSupabase() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.error("Error al cargar las tareas:", error);
  } else {
    renderTasks(data);
  }
}

function renderTasks(tasks) {
  const tasksTable = document.getElementById('tasks-table').querySelector('tbody');
  tasksTable.innerHTML = ''; // Limpiar la tabla antes de renderizar

  tasks.forEach(task => {
    const row = tasksTable.insertRow();

    row.insertCell(0).textContent = task.section;
    row.insertCell(1).textContent = task.title;
    row.insertCell(2).textContent = task.details;
    row.insertCell(3).textContent = new Date(task.date_time).toLocaleString();
    row.insertCell(4).textContent = decryptEmail(task.email); // Asumiendo que tienes una función decryptEmail
    row.insertCell(5).textContent = new Date(task.deadline).toLocaleString();
    row.insertCell(6).textContent = task.person_in_charge;
    row.insertCell(7).textContent = task.status;

    // Checkbox para marcar como completado
    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.checked = task.status === 'Completado';
    completeCheckbox.addEventListener('change', () => {
      updateTaskInSupabase(task.id, { status: completeCheckbox.checked ? 'Completado' : 'Pendiente' });
    });
    row.insertCell(8).appendChild(completeCheckbox);

    // Botón para editar
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => selectTaskForEditing(task));
    row.insertCell(9).appendChild(editButton);
    
    row.addEventListener('click', () => {
      selectTaskForEditing(task);
    });
  });
}

function selectTaskForEditing(task) {
  selectedTaskId = task.id;
  document.getElementById('title').value = task.title;
  document.getElementById('details').value = task.details;
  document.getElementById('date-time').value = task.date_time;
  document.getElementById('section').value = task.section;
  document.getElementById('email').value = decryptEmail(task.email);
  document.getElementById('deadline').value = task.deadline;
  document.getElementById('person-in-charge').value = task.person_in_charge;

  document.getElementById('edit-task').disabled = false;
  document.getElementById('delete-task').disabled = false;
}

async function updateTaskInSupabase(taskId, updatedTask) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updatedTask)
    .eq('id', taskId);

  if (error) {
    console.error("Error al actualizar la tarea:", error);
  } else {
    console.log("Tarea actualizada:", data);
    loadTasksFromSupabase(); // Recargar las tareas después de actualizar
    clearFields();
  }
}

async function deleteTaskFromSupabase(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error("Error al eliminar la tarea:", error);
  } else {
    console.log("Tarea eliminada:", data);
    loadTasksFromSupabase(); // Recargar las tareas después de eliminar
    clearFields();
  }
}

// Funciones para manejar los botones
document.getElementById('add-task').addEventListener('click', addTask);
document.getElementById('edit-task').addEventListener('click', () => {
  if (selectedTaskId) {
    const updatedTask = {
      section: document.getElementById('section').value,
      title: document.getElementById('title').value.trim(),
      details: document.getElementById('details').value.trim(),
      date_time: document.getElementById('date-time').value,
      email: encryptEmail(document.getElementById('email').value.trim()),
      deadline: document.getElementById('deadline').value,
      person_in_charge: document.getElementById('person-in-charge').value.trim(),
      status: 'Pendiente'
    };
    updateTaskInSupabase(selectedTaskId, updatedTask);
  }
});

document.getElementById('delete-task').addEventListener('click', () => {
  if (selectedTaskId) {
    deleteTaskFromSupabase(selectedTaskId);
  }
});

// Función para cargar las tareas al iniciar la aplicación
document.addEventListener('DOMContentLoaded', loadTasksFromSupabase);

// Función para encriptar el correo (ejemplo básico)
function encryptEmail(email) {
  return btoa(email); // Base64 encoding como ejemplo simple
}

// Función para desencriptar el correo
function decryptEmail(encryptedEmail) {
  return atob(encryptedEmail);
}
