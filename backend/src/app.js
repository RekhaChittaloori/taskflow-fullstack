import express from "express";
import cors from "cors";
import db from "./db/database.js";
import taskRoutes from "./routes/tasks.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        message: "TaskFlow API is running"
    });
});

app.get("/api/boards/1", (req, res) => {
    try {
        const board = db
            .prepare(`
                SELECT id, name
                FROM boards
                WHERE id = ?
            `)
            .get(1);

        if (!board) {
            return res.status(404).json({
                error: "Board not found"
            });
        }

        const columns = db
            .prepare(`
                SELECT id, name, position
                FROM columns
                WHERE board_id = ?
                ORDER BY position
            `)
            .all(board.id);

        const getTasks = db.prepare(`
            SELECT
                id,
                column_id,
                title,
                description,
                priority,
                created_at
            FROM tasks
            WHERE column_id = ?
            ORDER BY created_at DESC
        `);

        const columnsWithTasks = columns.map((column) => ({
            ...column,
            tasks: getTasks.all(column.id)
        }));

        res.json({
            ...board,
            columns: columnsWithTasks
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch board"
        });
    }
});

app.use("/api/tasks", taskRoutes);

export default app;