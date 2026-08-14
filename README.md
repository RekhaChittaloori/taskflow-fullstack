# TaskFlow

A lightweight full-stack task board built as a take-home assignment for a Full-Stack Developer role.

TaskFlow allows users to create, edit, delete, filter, and move tasks between columns. All task changes are handled through a Node.js/Express backend and persisted in a SQLite database.

## Live Demo

**Frontend:** https://taskflow-fullstack-two.vercel.app

**Backend API:** https://taskflow-fullstack-1lir.onrender.com

**GitHub:** https://github.com/RekhaChittaloori/taskflow-fullstack

## Tech Stack

### Frontend

* React
* JavaScript
* Vite
* CSS

### Backend

* Node.js
* Express
* better-sqlite3
* REST API

### Database

* SQLite

### Testing

* Vitest
* Supertest

## Features

* View a board with columns and tasks
* Create a new task
* Edit an existing task
* Delete a task
* Move a task between columns using a dropdown
* Filter tasks by priority
* Backend validation for required task titles
* Frontend validation and user-friendly error handling
* Persistent relational SQLite database
* Seed data for a fresh database
* Task count per column

## Project Structure

```text
taskflow/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js
│   │   │   ├── databaseQueries.js
│   │   │   ├── schema.sql
│   │   │   ├── seed.js
│   │   │   └── testQueries.js
│   │   ├── routes/
│   │   │   └── tasks.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   └── tasks.test.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

## Database Design

The database contains three relational tables:

* `boards`
* `columns`
* `tasks`

Relationships:

```text
Board
  |
  └── Columns
        |
        └── Tasks
```

Each column belongs to a board, and each task belongs to a column.

Required fields use `NOT NULL`, primary keys are defined for every table, and foreign keys enforce the relationships between tables.

Task priority is restricted to:

* Low
* Medium
* High

The complete schema is available in:

```text
backend/src/db/schema.sql
```

## Important SQL Queries

The application uses actual SQL queries for database operations rather than fetching all records and filtering them in application code.

### 1. Task count per column

```sql
SELECT
    c.id,
    c.name,
    COUNT(t.id) AS task_count
FROM columns c
LEFT JOIN tasks t
    ON t.column_id = c.id
WHERE c.board_id = ?
GROUP BY c.id, c.name
ORDER BY c.position;
```

### 2. Tasks by priority, newest first

```sql
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
ORDER BY t.created_at DESC;
```

The query implementations are available in:

```text
backend/src/db/databaseQueries.js
```

## API Endpoints

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/api/health`              | Health check                     |
| GET    | `/api/boards/1`            | Get board with columns and tasks |
| GET    | `/api/tasks`               | Get all tasks                    |
| GET    | `/api/tasks?priority=High` | Filter tasks by priority         |
| POST   | `/api/tasks`               | Create a task                    |
| PUT    | `/api/tasks/:id`           | Edit a task                      |
| DELETE | `/api/tasks/:id`           | Delete a task                    |
| PATCH  | `/api/tasks/:id/move`      | Move a task to another column    |

## Running Locally

### Prerequisites

* Node.js installed
* npm installed

### Backend

```bash
cd backend
npm install
npm start
```

The backend starts on:

```text
http://localhost:5000
```

For development with automatic restart:

```bash
npm run dev
```

### Seed Data

To initialize a fresh database with sample data:

```bash
cd backend
node src/db/seed.js
```

The seed script creates:

* One TaskFlow board
* To Do column
* In Progress column
* Done column
* One sample task in each column

The script checks whether seed data already exists before inserting it again.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Running Tests

From the backend directory:

```bash
cd backend
npm test
```

The test suite includes:

1. Creating a task with an empty title fails with a `400` response.
2. Moving a task updates its column correctly.
3. The task-count database query returns the expected results for the seeded data.

## Validation and Error Handling

Task creation validates the title on both the frontend and backend.

An empty or whitespace-only title is rejected by the backend with a `400 Bad Request` response.

The frontend displays user-friendly loading and error states rather than exposing raw backend errors.

## Design Decisions and Assumptions

The assignment allowed either drag-and-drop or a simpler control for moving tasks. I chose a column dropdown because it is reliable, easy to understand, and avoids adding unnecessary complexity to the core implementation.

SQLite was selected because it is lightweight, relational, easy to run locally, and does not require a separately managed database server.

Authentication, multiple users or teams, real-time synchronization, file uploads, and other explicitly out-of-scope features were intentionally not implemented.

## What I Would Improve With More Time

With additional time, I would add:

* Drag-and-drop task movement
* Search by task title
* More comprehensive automated test coverage
* Improved task ordering within columns
* Environment-based API configuration
* A production-ready persistent database service for hosted deployments

## Development Notes

I built the application incrementally, starting with the relational database schema and backend API, then adding automated tests and finally connecting the React frontend.

The main focus was on making the core workflow reliable: persistent data, validation, error handling, CRUD operations, task movement, and database-level queries.

## Interesting Learning

One useful part of the implementation was working directly with relational SQL instead of relying only on convenience methods. In particular, using a `LEFT JOIN` with `COUNT` makes it possible to display every board column, including columns that currently contain zero tasks.

## Deployment

The frontend is deployed on Vercel and the backend is deployed on Render.

```text
React / Vercel
      ↓
Node.js + Express / Render
      ↓
SQLite
```

## License

This project was created for evaluation as part of a Full-Stack Developer take-home assignment.
