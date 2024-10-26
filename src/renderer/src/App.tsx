import React, { useEffect, useState } from 'react';
const { ipcRenderer } = window.require('electron')
import './App.css';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

window.addEventListener('dblclick', () => {
  console.log('invoke window-dock');
  ipcRenderer.invoke('window-dock');
});

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      const fetchedTodos = await ipcRenderer.invoke('get-todos');
      setTodos(fetchedTodos);
    };
    loadTodos();
  }, []);

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      const todo = await ipcRenderer.invoke('add-todo', newTodo.trim());
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    await ipcRenderer.invoke('toggle-todo', todo.id, !todo.done);
    setTodos(todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t));
  };

  const handleUpdateTodo = async (todo: Todo, newText: string) => {
    await ipcRenderer.invoke('update-todo', todo.id, newText);
    setTodos(todos.map(t => t.id === todo.id ? { ...t, text: newText } : t));
  };

  const handleDeleteTodo = async (todo: Todo) => {
    await ipcRenderer.invoke('delete-todo', todo.id);
    setTodos(todos.filter(t => t.id !== todo.id));
  };

  return (
    <div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li
            key={todo.id}
            className={`todo-item ${todo.done ? 'done' : ''}`}
            onClick={() => handleToggleTodo(todo)}
          >
            {todo.text}
          </li>
        ))}
      </ul>
      <input
        className="add-todo"
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
        placeholder="Add a new todo"
      />
    </div>
  );
}

export default App;
