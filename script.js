document.addEventListener('DOMContentLoaded', () => {
    // Cargar las tareas de Supabase cuando la página esté lista
    loadTasksFromSupabase();
    setDefaultDateTime();

    // Vincular el botón de agregar tarea a la función correspondiente
    document.getElementById('add-task-btn').addEventListener('click', addTask);
});

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

function renderTasks() {
    const tasksTableBody = document.querySelector('#tasks-table tbody');
    tasksTableBody.innerHTML = '';

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.section}</td>
            <td>${task.title}</td>
            <td>${task.details}</td>
            <td>${task.date_time}</td>
            <td>${decryptEmail(task.email)}</td>
            <td>${task.deadline}</td>
            <td>${task.person_in_charge}</td>
            <td>${task.status}</td>
            <td>
                <button onclick="editTask(${task.id})">Editar</button>
                <button onclick="completeTask(${task.id})">Completado</button>
                <button onclick="deleteTask(${task.id})">Eliminar</button>
            </td>
        `;
        tasksTableBody.appendChild(row);
    });
}

// Ejemplo básico de encriptación y desencriptación
function encryptEmail(email) {
    return btoa(email);
}

function decryptEmail(encryptedEmail) {
    return atob(encryptedEmail);
}

// Función para editar una tarea
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('title').value = task.title;
        document.getElementById('details').value = task.details;
        document.getElementById('date-time').value = task.date_time;
        document.getElementById('section').value = task.section;
        document.getElementById('email').value = decryptEmail(task.email);
        document.getElementById('deadline').value = task.deadline;
        document.getElementById('person-in-charge').value = task.person_in_charge;

        // Vincula el botón de agregar tarea a la función de actualización
        document.getElementById('add-task-btn').innerText = 'Actualizar Tarea';
        document.getElementById('add-task-btn').onclick = () => updateTaskInSupabase(taskId, getTaskFromForm());
    }
}

function completeTask(taskId) {
    const updatedTask = { status: 'Completado' };
    updateTaskInSupabase(taskId, updatedTask);
}

function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        deleteTaskFromSupabase(taskId);
    }
}

function getTaskFromForm() {
    return {
        section: document.getElementById('section').value,
        title: document.getElementById('title').value.trim(),
        details: document.getElementById('details').value.trim(),
        date_time: document.getElementById('date-time').value,
        email: encryptEmail(document.getElementById('email').value.trim()),
        deadline: document.getElementById('deadline').value,
        person_in_charge: document.getElementById('person-in-charge').value.trim(),
        status: 'Pendiente'
    };
}
