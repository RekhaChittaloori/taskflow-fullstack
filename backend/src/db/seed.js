import db from "./database.js";

const boardExists = db
    .prepare("SELECT id FROM boards LIMIT 1")
    .get();

if (boardExists) {
    console.log("Seed data already exists.");
    process.exit(0);
}

const insertBoard = db.prepare(`
    INSERT INTO boards (name)
    VALUES (?)
`);

const insertColumn = db.prepare(`
    INSERT INTO columns (board_id, name, position)
    VALUES (?, ?, ?)
`);

const insertTask = db.prepare(`
    INSERT INTO tasks
    (column_id, title, description, priority)
    VALUES (?, ?, ?, ?)
`);

const seedDatabase = db.transaction(() => {
    const board = insertBoard.run("TaskFlow Board");

    const todo = insertColumn.run(
        board.lastInsertRowid,
        "To Do",
        1
    );

    const inProgress = insertColumn.run(
        board.lastInsertRowid,
        "In Progress",
        2
    );

    const done = insertColumn.run(
        board.lastInsertRowid,
        "Done",
        3
    );

    insertTask.run(
        todo.lastInsertRowid,
        "Design database schema",
        "Create tables and relationships",
        "High"
    );

    insertTask.run(
        inProgress.lastInsertRowid,
        "Build REST API",
        "Implement task endpoints",
        "Medium"
    );

    insertTask.run(
        done.lastInsertRowid,
        "Create project",
        "Initialize TaskFlow project",
        "Low"
    );
});

seedDatabase();

console.log("Seed data inserted successfully.");