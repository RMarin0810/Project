// Configuración de Superbase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsiiqfmwyjyufpnxsnps.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // Asegúrate de que esta clave esté configurada correctamente en tu entorno
const supabase = createClient(supabaseUrl, supabaseKey);

async function addTaskToSupabase(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task]);

  if (error) {
    console.error("Error adding task:", error);
  } else {
    console.log("Task added:", data);
    tasks.push(task); // Actualiza la lista local de tareas
    renderTasks();
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


async function loadTasksFromSupabase() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.error("Error loading tasks:", error);
  } else {
    tasks = data;
    renderTasks();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromSupabase();
  setDefaultDateTime();
});

async function updateTaskInSupabase(taskId, updatedTask) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updatedTask)
    .eq('id', taskId);

  if (error) {
    console.error("Error updating task:", error);
  } else {
    console.log("Task updated:", data);
    renderTasks();
  }
}

async function deleteTaskFromSupabase(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error("Error deleting task:", error);
  } else {
    console.log("Task deleted:", data);
    renderTasks();
  }
}
