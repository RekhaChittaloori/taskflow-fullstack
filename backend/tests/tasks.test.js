import { describe, test, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import db from "../src/db/database.js";
import { getTaskCountPerColumn } from "../src/db/databaseQueries.js";

describe("TaskFlow API", () => {

    let testTaskId;

    test("creating a task with no title fails", async () => {
        const response = await request(app)
            .post("/api/tasks")
            .send({
                columnId: 1,
                title: "",
                priority: "High"
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "Task title is required"
        );
    });

    test("moving a task updates its column correctly", async () => {

        const createResponse = await request(app)
            .post("/api/tasks")
            .send({
                columnId: 1,
                title: "Move Test Task",
                priority: "Medium"
            });

        expect(createResponse.status).toBe(201);

        testTaskId = createResponse.body.id;

        const moveResponse = await request(app)
            .patch(`/api/tasks/${testTaskId}/move`)
            .send({
                columnId: 2
            });

        expect(moveResponse.status).toBe(200);
        expect(moveResponse.body.column_id).toBe(2);

        const task = db
            .prepare(`
                SELECT column_id
                FROM tasks
                WHERE id = ?
            `)
            .get(testTaskId);

        expect(task.column_id).toBe(2);

        db.prepare(`
            DELETE FROM tasks
            WHERE id = ?
        `).run(testTaskId);
    });

    test("task count per column query returns correct results", () => {

        const results = getTaskCountPerColumn(1);

        expect(results).toHaveLength(3);

        const todoColumn = results.find(
            column => column.name === "To Do"
        );

        const inProgressColumn = results.find(
            column => column.name === "In Progress"
        );

        const doneColumn = results.find(
            column => column.name === "Done"
        );

        expect(todoColumn.task_count).toBe(1);
        expect(inProgressColumn.task_count).toBe(1);
        expect(doneColumn.task_count).toBe(1);
    });

});