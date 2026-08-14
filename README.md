# TaskFlow

## Live Demo

Backend: https://taskflow-fullstack-1lir.onrender.com

TaskFlow is a lightweight full-stack task board built as a take-home assignment for a Full-Stack Developer role.

It allows users to create, edit, delete, filter, and move tasks between columns. All changes are persisted to a SQLite database through a Node.js/Express backend.

## Tech Stack

### Frontend
- React
- JavaScript
- Vite
- CSS

### Backend
- Node.js
- Express
- better-sqlite3
- REST API

### Database
- SQLite

### Testing
- Vitest
- Supertest

## Features

- View board with columns and tasks
- Create a task
- Edit a task
- Delete a task
- Move a task between columns
- Filter tasks by priority
- Backend validation for required task title
- User-friendly error handling
- Persistent SQLite database
- Seed data for a fresh database
- Task count per column

## Project Structure

```text
taskflow/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js
│   │   │   ├── databaseQueries.js
│   │   │   ├── schema.sql
│   │   │   └── seed.js
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
│   │   └── main.jsx
│   └── package.json
│
├── README.md
└── .gitignore