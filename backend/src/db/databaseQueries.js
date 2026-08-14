import db from "./database.js";

// Query 1: Count tasks in each column for a board
export function getTaskCountPerColumn(boardId) {
    return db
        .prepare(`
            SELECT
                c.id,
                c.name,
                COUNT(t.id) AS task_count
            FROM columns c
            LEFT JOIN tasks t
                ON t.column_id = c.id
            WHERE c.board_id = ?
            GROUP BY c.id, c.name
            ORDER BY c.position
        `)
        .all(boardId);
}

// Query 2: Get tasks with a specific priority,
// newest tasks first
export function getTasksByPriority(boardId, priority) {
    return db
        .prepare(`
            SELECT
                t.id,
                t.title,
                t.description,
                t.priority,
                t.created_at,
                c.name AS column_name
            FROM tasks t
            JOIN columns c
                ON c.id = t.column_id
            WHERE c.board_id = ?
              AND t.priority = ?
            ORDER BY t.created_at DESC
        `)
        .all(boardId, priority);
}