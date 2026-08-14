import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://taskflow-fullstack-1lir.onrender.com/api";;

const priorities = ["Low", "Medium", "High"];

function App() {
    const [board, setBoard] = useState(null);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedColumnId, setSelectedColumnId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        columnId: 1
    });

    const fetchBoard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/boards/1`
            );

            if (!response.ok) {
                throw new Error("Failed to load board");
            }

            const data = await response.json();
            setBoard(data);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, []);

    const openCreateForm = (columnId) => {
        setEditingTask(null);

        setFormData({
            title: "",
            description: "",
            priority: "Medium",
            columnId
        });

        setSelectedColumnId(columnId);
        setShowForm(true);
    };

    const openEditForm = (task) => {
        setEditingTask(task);

        setFormData({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            columnId: task.column_id
        });

        setSelectedColumnId(task.column_id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingTask(null);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            setError("Task title is required");
            return;
        }

        try {
            setError("");

            const url = editingTask
                ? `${API_URL}/tasks/${editingTask.id}`
                : `${API_URL}/tasks`;

            const method = editingTask ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    ...(editingTask
                        ? {}
                        : {
                              columnId: Number(
                                  formData.columnId
                              )
                          })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to save task"
                );
            }

            closeForm();
            await fetchBoard();

        } catch (err) {
            setError(
                err.message || "Failed to save task"
            );
        }
    };

    const handleDelete = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to delete task"
                );
            }

            await fetchBoard();

        } catch (err) {
            setError(
                err.message || "Failed to delete task"
            );
        }
    };

    const handleMove = async (taskId, columnId) => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/tasks/${taskId}/move`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        columnId: Number(columnId)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to move task"
                );
            }

            await fetchBoard();

        } catch (err) {
            setError(
                err.message || "Failed to move task"
            );
        }
    };

    if (loading) {
        return (
            <div className="status">
                Loading TaskFlow...
            </div>
        );
    }

    if (error && !board) {
        return (
            <div className="status error">
                <p>{error}</p>
                <button onClick={fetchBoard}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="app">
            <header className="header">
                <div>
                    <h1>TaskFlow</h1>
                    <p>Simple team task board</p>
                </div>

                <div className="filter">
                    <label htmlFor="priority-filter">
                        Priority:
                    </label>

                    <select
                        id="priority-filter"
                        value={filter}
                        onChange={(event) =>
                            setFilter(event.target.value)
                        }
                    >
                        <option value="All">All</option>

                        {priorities.map((priority) => (
                            <option
                                key={priority}
                                value={priority}
                            >
                                {priority}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {error && board && (
                <div className="error-banner">
                    {error}
                    <button
                        onClick={() => setError("")}
                    >
                        ×
                    </button>
                </div>
            )}

            <main className="board">
                {board.columns.map((column) => {
                    const visibleTasks =
                        column.tasks.filter(
                            (task) =>
                                filter === "All" ||
                                task.priority === filter
                        );

                    return (
                        <section
                            className="column"
                            key={column.id}
                        >
                            <div className="column-header">
                                <div>
                                    <h2>{column.name}</h2>

                                    <span>
                                        {visibleTasks.length} task
                                        {visibleTasks.length !==
                                        1
                                            ? "s"
                                            : ""}
                                    </span>
                                </div>

                                <button
                                    className="add-button"
                                    onClick={() =>
                                        openCreateForm(
                                            column.id
                                        )
                                    }
                                >
                                    + Add Task
                                </button>
                            </div>

                            <div className="task-list">
                                {visibleTasks.length === 0 ? (
                                    <div className="empty">
                                        No tasks
                                    </div>
                                ) : (
                                    visibleTasks.map(
                                        (task) => (
                                            <article
                                                className="task-card"
                                                key={task.id}
                                            >
                                                <div className="task-top">
                                                    <h3>
                                                        {
                                                            task.title
                                                        }
                                                    </h3>

                                                    <span
                                                        className={`priority ${task.priority.toLowerCase()}`}
                                                    >
                                                        {
                                                            task.priority
                                                        }
                                                    </span>
                                                </div>

                                                {task.description && (
                                                    <p>
                                                        {
                                                            task.description
                                                        }
                                                    </p>
                                                )}

                                                <div className="task-actions">
                                                    <button
                                                        onClick={() =>
                                                            openEditForm(
                                                                task
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                task.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                    <select
                                                        value={
                                                            task.column_id
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleMove(
                                                                task.id,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {board.columns.map(
                                                            (
                                                                targetColumn
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        targetColumn.id
                                                                    }
                                                                    value={
                                                                        targetColumn.id
                                                                    }
                                                                >
                                                                    Move to{" "}
                                                                    {
                                                                        targetColumn.name
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                            </article>
                                        )
                                    )
                                )}
                            </div>
                        </section>
                    );
                })}
            </main>

            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>
                                {editingTask
                                    ? "Edit Task"
                                    : "Create Task"}
                            </h2>

                            <button
                                className="close-button"
                                onClick={closeForm}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label htmlFor="title">
                                Title *
                            </label>

                            <input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={
                                    handleFormChange
                                }
                                placeholder="Enter task title"
                                autoFocus
                            />

                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleFormChange
                                }
                                placeholder="Optional description"
                                rows="4"
                            />

                            <label htmlFor="priority">
                                Priority
                            </label>

                            <select
                                id="priority"
                                name="priority"
                                value={
                                    formData.priority
                                }
                                onChange={
                                    handleFormChange
                                }
                            >
                                {priorities.map(
                                    (priority) => (
                                        <option
                                            key={priority}
                                            value={priority}
                                        >
                                            {priority}
                                        </option>
                                    )
                                )}
                            </select>

                            {!editingTask && (
                                <>
                                    <label htmlFor="columnId">
                                        Column
                                    </label>

                                    <select
                                        id="columnId"
                                        name="columnId"
                                        value={
                                            formData.columnId
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >
                                        {board.columns.map(
                                            (column) => (
                                                <option
                                                    key={
                                                        column.id
                                                    }
                                                    value={
                                                        column.id
                                                    }
                                                >
                                                    {
                                                        column.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                >
                                    {editingTask
                                        ? "Save Changes"
                                        : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;