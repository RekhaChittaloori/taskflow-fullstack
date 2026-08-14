import db from "./database.js";
import {
    getTaskCountPerColumn,
    getTasksByPriority
} from "./databaseQueries.js";

console.log("Task count per column:");

console.table(
    getTaskCountPerColumn(1)
);

console.log("High priority tasks:");

console.table(
    getTasksByPriority(1, "High")
);

db.close();