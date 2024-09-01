// Configuración de Supabase
const supabaseUrl = 'https://tsiiqfmwyjyufpnxsnps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaWlxZm13eWp5dWZwbnhzbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4OTcyNzMsImV4cCI6MjA0MDQ3MzI3M30.rwXtg9LCO1g_Us2BdrXwaK4Y0UfD-Fndax7RPYQgtkI';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let selectedTaskId = null;

async function addTaskToSupabase(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task]);

  if (error) {
    console.error("Error al agregar la tarea:", error);
  } else {
    console.log("Tarea agregada:", data);
    loadTasksFromSupabase();
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

  const newTask = {
    section,
    title,
    details,
    date_time: dateTime,
    email,
    deadline,
    person_in_charge: personInCharge,
    status: 'Pendiente'
  };

  if (selectedTaskId) {
    updateTaskInSupabase(selectedTaskId, newTask);
  } else {
    addTaskToSupabase(newTask);
  }
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
  const tasksTableBody = document.querySelector('#tasks-table tbody');
  tasksTableBody.innerHTML = '';

  tasks.forEach(task => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${task.section}</td>
      <td>${task.title}</td>
      <td>${task.details}</td>
      <td>${task.date_time}</td>
      <td>${task.email}</td>
      <td>${task.deadline}</td>
      <td>${task.person_in_charge}</td>
      <td>${task.status}</td>
      <td><button class="edit-btn" data-id="${task.id}">Editar</button></td>
      <td><button class="delete-btn" data-id="${task.id}">Eliminar</button></td>
    `;

    tasksTableBody.appendChild(row);
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
      editTask(button.dataset.id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      deleteTask(button.dataset.id);
    });
  });
}

function clearFields() {
  document.getElementById('task-form').reset();
  selectedTaskId = null;
}

async function editTask(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    console.error("Error al cargar la tarea:", error);
  } else {
    document.getElementById('section').value = data.section;
    document.getElementById('title').value = data.title;
    document.getElementById('details').value = data.details;
    document.getElementById('date-time').value = data.date_time;
    document.getElementById('deadline').value = data.deadline;
    document.getElementById('email').value = data.email;
    document.getElementById('person-in-charge').value = data

.person_in_charge;

    selectedTaskId = data.id;
  }
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
    loadTasksFromSupabase();
    clearFields();
  }
}

async function deleteTask(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error("Error al eliminar la tarea:", error);
  } else {
    console.log("Tarea eliminada:", data);
    loadTasksFromSupabase();
  }
}

document.getElementById('add-task').addEventListener('click', addTask);
document.getElementById('edit-task').addEventListener('click', addTask);
document.getElementById('delete-task').addEventListener('click', () => {
  if (selectedTaskId) {
    deleteTask(selectedTaskId);
  } else {
    alert('Seleccione una tarea para eliminar.');
  }
});

document.addEventListener('DOMContentLoaded', loadTasksFromSupabase);
