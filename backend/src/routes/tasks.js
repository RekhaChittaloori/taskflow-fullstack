import express from "express";
import db from "../db/database.js";

const router = express.Router();

const VALID_PRIORITIES = ["Low", "Medium", "High"];

/*
 * GET /api/tasks
 *
 * Optional filters:
 * /api/tasks?priority=High
 */
router.get("/", (req, res) => {
    try {
        const { priority } = req.query;

        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                error: "Priority must be Low, Medium, or High"
            });
        }

        let query = `
            SELECT
                t.id,
                t.column_id,
                t.title,
                t.description,
                t.priority,
                t.created_at,
                c.name AS column_name
            FROM tasks t
            JOIN columns c ON c.id = t.column_id
        `;

        const params = [];

        if (priority) {
            query += `
                WHERE t.priority = ?
            `;

            params.push(priority);
        }

        query += `
            ORDER BY t.created_at DESC
        `;

        const tasks = db.prepare(query).all(...params);

        res.json(tasks);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});


/*
 * POST /api/tasks
 *
 * Create a new task.
 */
router.post("/", (req, res) => {
    try {
        const {
            columnId,
            title,
            description = "",
            priority = "Medium"
        } = req.body;

        // Backend validation
        if (
            typeof title !== "string" ||
            title.trim().length === 0
        ) {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        if (!columnId) {
            return res.status(400).json({
                error: "Column is required"
            });
        }

        if (!VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                error: "Priority must be Low, Medium, or High"
            });
        }

        // Check that column exists
        const column = db
            .prepare(`
                SELECT id
                FROM columns
                WHERE id = ?
            `)
            .get(columnId);

        if (!column) {
            return res.status(404).json({
                error: "Column not found"
            });
        }

        const result = db
            .prepare(`
                INSERT INTO tasks
                (column_id, title, description, priority)
                VALUES (?, ?, ?, ?)
            `)
            .run(
                columnId,
                title.trim(),
                description,
                priority
            );

        const task = db
            .prepare(`
                SELECT
                    id,
                    column_id,
                    title,
                    description,
                    priority,
                    created_at
                FROM tasks
                WHERE id = ?
            `)
            .get(result.lastInsertRowid);

        res.status(201).json(task);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create task"
        });
    }
});


/*
 * PUT /api/tasks/:id
 *
 * Edit title, description and priority.
 */
router.put("/:id", (req, res) => {
    try {
        const taskId = Number(req.params.id);

        const {
            title,
            description = "",
            priority = "Medium"
        } = req.body;

        if (
            typeof title !== "string" ||
            title.trim().length === 0
        ) {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        if (!VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                error: "Priority must be Low, Medium, or High"
            });
        }

        const existingTask = db
            .prepare(`
                SELECT id
                FROM tasks
                WHERE id = ?
            `)
            .get(taskId);

        if (!existingTask) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        db.prepare(`
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                priority = ?
            WHERE id = ?
        `).run(
            title.trim(),
            description,
            priority,
            taskId
        );

        const updatedTask = db
            .prepare(`
                SELECT
                    id,
                    column_id,
                    title,
                    description,
                    priority,
                    created_at
                FROM tasks
                WHERE id = ?
            `)
            .get(taskId);

        res.json(updatedTask);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});


/*
 * DELETE /api/tasks/:id
 */
router.delete("/:id", (req, res) => {
    try {
        const taskId = Number(req.params.id);

        const result = db
            .prepare(`
                DELETE FROM tasks
                WHERE id = ?
            `)
            .run(taskId);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});


/*
 * PATCH /api/tasks/:id/move
 *
 * Move a task to another column.
 */
router.patch("/:id/move", (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const { columnId } = req.body;

        if (!columnId) {
            return res.status(400).json({
                error: "Target column is required"
            });
        }

        const task = db
            .prepare(`
                SELECT id
                FROM tasks
                WHERE id = ?
            `)
            .get(taskId);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const column = db
            .prepare(`
                SELECT id
                FROM columns
                WHERE id = ?
            `)
            .get(columnId);

        if (!column) {
            return res.status(404).json({
                error: "Target column not found"
            });
        }

        db.prepare(`
            UPDATE tasks
            SET column_id = ?
            WHERE id = ?
        `).run(columnId, taskId);

        const updatedTask = db
            .prepare(`
                SELECT
                    id,
                    column_id,
                    title,
                    description,
                    priority,
                    created_at
                FROM tasks
                WHERE id = ?
            `)
            .get(taskId);

        res.json(updatedTask);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to move task"
        });
    }
});


export default router;