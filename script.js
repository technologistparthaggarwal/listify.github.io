document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('new-todo');
    const dueDateInput = document.getElementById('due-date');
    const priorityInput = document.getElementById('priority');
    const todoList = document.getElementById('todo-list');
    const filterAll = document.getElementById('filter-all');
    const filterActive = document.getElementById('filter-active');
    const filterCompleted = document.getElementById('filter-completed');
    const clearCompletedButton = document.getElementById('clear-completed');
    const sortDateButton = document.getElementById('sort-date');
    const sortPriorityButton = document.getElementById('sort-priority');
    const listViewButton = document.getElementById('list-view');
    const calendarViewButton = document.getElementById('calendar-view');
    const listTab = document.getElementById('list-tab');
    const calendarTab = document.getElementById('calendar-tab');
    const calendarEl = document.getElementById('calendar');
    
    let filter = 'all';
    let calendar;
    
    const loadTodos = () => {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(todo => addTodoToDOM(todo));
        updateCalendar(todos);
    };

    const saveTodos = (todos) => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const addTodoToDOM = (todo) => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';
        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span contenteditable="true">${todo.text}</span>
                <span>${todo.dueDate}</span>
                <span>${todo.priority}</span>
                <button>Delete</button>
            </div>
        `;
        li.querySelector('input[type="checkbox"]').onchange = () => {
            todo.completed = !todo.completed;
            updateTodo(todo);
            filterTodos();
        };
        li.querySelector('button').onclick = (e) => {
            e.stopPropagation();
            li.remove();
            deleteTodo(todo);
        };
        li.querySelector('[contenteditable]').onblur = (e) => {
            todo.text = e.target.textContent;
            updateTodo(todo);
        };
        if (filter === 'all' || (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed)) {
            todoList.appendChild(li);
        }
    };

    const addTodo = (text, dueDate, priority) => {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const newTodo = { text, dueDate, priority, completed: false };
        todos.push(newTodo);
        saveTodos(todos);
        addTodoToDOM(newTodo);
        updateCalendar(todos);
    };

    const deleteTodo = (todoToDelete) => {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos = todos.filter(todo => todo.text !== todoToDelete.text);
        saveTodos(todos);
        updateCalendar(todos);
    };

    const updateTodo = (updatedTodo) => {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos = todos.map(todo => todo.text === updatedTodo.text ? updatedTodo : todo);
        saveTodos(todos);
        updateCalendar(todos);
    };

    const filterTodos = () => {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todoList.innerHTML = '';
        todos.forEach(todo => addTodoToDOM(todo));
    };

    const clearCompletedTodos = () => {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos = todos.filter(todo => !todo.completed);
        saveTodos(todos);
        filterTodos();
        updateCalendar(todos);
    };

    const sortTodos = (sortBy) => {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        if (sortBy === 'date') {
            todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === 'priority') {
            const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
            todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        saveTodos(todos);
        filterTodos();
    };

    const setActiveFilterButton = (button) => {
        document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    };

    const setActiveTabButton = (button) => {
        document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    };

    listViewButton.onclick = () => {
        listTab.style.display = 'block';
        calendarTab.style.display = 'none';
        setActiveTabButton(listViewButton);
    };

    calendarViewButton.onclick = () => {
        listTab.style.display = 'none';
        calendarTab.style.display = 'block';
        setActiveTabButton(calendarViewButton);
        updateCalendar(JSON.parse(localStorage.getItem('todos')) || []);
    };

    filterAll.onclick = () => {
        filter = 'all';
        filterTodos();
        setActiveFilterButton(filterAll);
    };

    filterActive.onclick = () => {
        filter = 'active';
        filterTodos();
        setActiveFilterButton(filterActive);
    };

    filterCompleted.onclick = () => {
        filter = 'completed';
        filterTodos();
        setActiveFilterButton(filterCompleted);
    };

    clearCompletedButton.onclick = () => {
        clearCompletedTodos();
    };

    sortDateButton.onclick = () => {
        sortTodos('date');
    };

    sortPriorityButton.onclick = () => {
        sortTodos('priority');
    };

    const updateCalendar = (todos) => {
        if (!calendar) {
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: todos.map(todo => ({
                    title: todo.text,
                    start: todo.dueDate,
                    backgroundColor: todo.completed ? '#d4edda' : '#f9f9f9',
                    borderColor: todo.completed ? '#d4edda' : '#f9f9f9',
                })),
            });
            calendar.render();
        } else {
            const events = todos.map(todo => ({
                title: todo.text,
                start: todo.dueDate,
                backgroundColor: todo.completed ? '#d4edda' : '#f9f9f9',
                borderColor: todo.completed ? '#d4edda' : '#f9f9f9',
            }));
            calendar.removeAllEvents();
            calendar.addEventSource(events);
        }
    };

    todoForm.onsubmit = (e) => {
        e.preventDefault();
        const newTodo = todoInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;
        if (newTodo) {
            addTodo(newTodo, dueDate, priority);
            todoInput.value = '';
            dueDateInput.value = '';
            priorityInput.value = 'low';
        }
    };

    loadTodos();
});
