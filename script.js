// Configuración de Supabase
const supabaseUrl = 'https://tsiiqfmwyjyufpnxsnps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaWlxZm13eWp5dWZwbnhzbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4OTcyNzMsImV4cCI6MjA0MDQ3MzI3M30.rwXtg9LCO1g_Us2BdrXwaK4Y0UfD-Fndax7RPYQgtkI'; // Puedes definirla aquí si no utilizas variables de entorno
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

async function addTaskToSupabase(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task]);

  if (error) {
    console.error("Error al agregar la tarea:", error);
  } else {
    console.log("Tarea agregada:", data);
    tasks.push(data[0]); // Asegúrate de que `tasks` esté definido y se actualice correctamente.
    renderTasks(); // Si tienes una función para renderizar las tareas en la interfaz.
    clearFields(); // Función que limpia los campos del formulario.
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

  const encryptedEmail = email ? encryptEmail(email) : ''; // Asegúrate de tener la función `encryptEmail` definida.
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
    console.error("Error al cargar las tareas:", error);
  } else {
    tasks = data;
    renderTasks(); // Si tienes una función para renderizar las tareas en la interfaz.
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromSupabase();
  setDefaultDateTime(); // Asegúrate de que `setDefaultDateTime` esté definida.
});

async function updateTaskInSupabase(taskId, updatedTask) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updatedTask)
    .eq('id', taskId);

  if (error) {
    console.error("Error al actualizar la tarea:", error);
  } else {
    console.log("Tarea actualizada:", data);
    renderTasks(); // Si tienes una función para renderizar las tareas en la interfaz.
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
    renderTasks(); // Si tienes una función para renderizar las tareas en la interfaz.
  }
}
