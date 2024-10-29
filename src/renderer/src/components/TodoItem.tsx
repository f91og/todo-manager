// TodoItem.tsx
import { useState } from 'react'

interface TodoItemProps {
  todo: { id: number; text: string; done: boolean };
  onToggle: (todo: { id: number; text: string; done: boolean }) => void;
}

function TodoItem({ todo, onToggle }: TodoItemProps): JSX.Element {
  const [isDone, setIsDone] = useState(todo.done)
  const handleToggle = () => {
    setIsDone(!isDone)
    onToggle({ ...todo, done: !isDone })
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
