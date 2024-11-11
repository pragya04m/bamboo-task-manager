import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const { signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
      error: (error) => console.error("Error fetching todos:", error), // Error handling
    });

    return () => {
      subscription.unsubscribe(); // Cleanup subscription when component is unmounted
    };
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content })
        .then(() => {
          // After creating a new todo, fetch the updated list
          client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
            error: (error) => console.error("Error fetching updated todos:", error),
          });
        })
        .catch((error) => {
          console.error("Error creating todo:", error);
          alert("Failed to create todo. Please try again.");
        });
    }
  }

  function deleteTodo(id: string) {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
      client.models.Todo.delete({ id })
        .then(() => {
          // After deleting, fetch the updated list
          client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
            error: (error) => console.error("Error fetching updated todos:", error),
          });
        })
        .catch((error) => {
          console.error("Error deleting todo:", error);
          alert("Failed to delete todo. Please try again.");
        });
    }
  }

  function updateTodo(id: string) {
    const newContent = window.prompt("Update Todo content");
    if (newContent) {
      client.models.Todo.update({ id, content: newContent })
        .then(() => {
          // After updating, fetch the updated list
          client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
            error: (error) => console.error("Error fetching updated todos:", error),
          });
        })
        .catch((error) => {
          console.error("Error updating todo:", error);
          alert("Failed to update todo. Please try again.");
        });
    }
  }

  return (
    <main>
      <h1>Tasks List</h1>
      <button className="task-name" onClick={createTodo}>+ New Task</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span className="task-name">{todo.content}</span>
            <div className="button-container">
              <button className="edit-button" onClick={(e) => { e.stopPropagation(); updateTodo(todo.id); }}>Edit</button>
              <button className="delete-button" onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
