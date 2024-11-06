// TodoItem.tsx
import { useState } from 'react'
const { ipcRenderer } = window.require('electron')

interface TodoItemProps {
  todo: { id: number; text: string; done: boolean };
}

function TodoItem({ todo }: TodoItemProps): JSX.Element {
  const [isDone, setIsDone] = useState(todo.done)
  const handleToggle = async () => {
    await ipcRenderer.invoke('toggle-todo', todo.id, !todo.done);
    setIsDone(!isDone)
  }
  
  return (
    <li
      className={`todo-item ${isDone ? 'done' : ''}`}
      onClick={handleToggle}
    >
      {todo.text}
    </li>
  )
}

export default TodoItem;
