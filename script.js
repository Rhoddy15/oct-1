
(() => {
  'use strict';

  const STORAGE_KEY = 'todo.tasks.v1';

  const input = document.getElementById('new-task');
  const addBtn = document.getElementById('add-task-btn');
  const list = document.getElementById('task-list');

  let tasks = loadTasks();


  addBtn.addEventListener('click', onAddClicked);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') onAddClicked(); });


  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = btn.closest('li.task');
    if (!li) return;
    const id = li.dataset.id;
    if (btn.dataset.action === 'toggle') toggleTask(id, li);
    if (btn.dataset.action === 'delete') deleteTask(id, li);
  });

  render();

  function onAddClicked() {
    const text = (input.value || '').trim();
    if (!text) {
      if (input.animate) {
        input.animate([
          { transform: 'translateX(0px)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(0px)' }
        ], { duration: 240, easing: 'ease' });
      }
      input.focus();
      return;
    }
    const task = createTask(text);
    tasks.unshift(task);
    saveTasks();
    render();
    input.value = '';
    input.focus();
  }

  function createTask(text){
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,8);
    return { id, text, completed: false, createdAt: Date.now() };
  }

  function toggleTask(id, li){
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks();
   
    if (tasks[idx].completed) li.classList.add('completed'); else li.classList.remove('completed');
    const btn = li.querySelector('button[data-action="toggle"]');
    if (btn) {
      btn.setAttribute('aria-label', tasks[idx].completed ? 'Mark incomplete' : 'Mark complete');
      btn.title = btn.getAttribute('aria-label');
    }
  }

  function deleteTask(id, li){
   
    li.style.transition = 'opacity .18s ease, transform .18s ease';
    li.style.opacity = '0';
    li.style.transform = 'translateX(10px) scale(.99)';
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, 180);
  }


  function loadTasks(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    }catch(err){
      console.warn('Failed to load tasks from storage', err);
      return [];
    }
  }

  function saveTasks(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }catch(err){
      console.warn('Failed to save tasks to storage', err);
    }
  }

  function render(){
    list.innerHTML = '';
    if (!tasks.length){
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No tasks yet — add something to get started.';
      list.appendChild(empty);
      return;
    }

    for (const task of tasks){
      const li = document.createElement('li');
      li.className = 'task' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = task.text;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'small-btn';
      toggle.dataset.action = 'toggle';
      toggle.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
      toggle.title = toggle.getAttribute('aria-label');
      toggle.textContent = task.completed ? '↺' : '✓';

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'small-btn';
      del.dataset.action = 'delete';
      del.setAttribute('aria-label', 'Delete task');
      del.title = 'Delete task';
      del.textContent = '🗑';

      actions.appendChild(toggle);
      actions.appendChild(del);

      li.appendChild(label);
      li.appendChild(actions);

      list.appendChild(li);
    }
  }

})();
