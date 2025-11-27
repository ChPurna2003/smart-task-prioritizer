🚀 Smart Task Prioritizer

A full-stack intelligent task scoring and prioritization system.

Live Demo
🔗 Frontend: https://smart-task-frontend.onrender.com

🔗 Backend API: https://smart-task-prioritizer.onrender.com/api/tasks/analyze/

📌 Overview

Smart Task Prioritizer helps users decide which tasks to work on first by analyzing:

⏰ Urgency (due date & overdue days)

⭐ Importance (1–10 scale)

🕒 Estimated effort (hours)

🔗 Dependencies between tasks

🧠 Smart Balance Algorithm (custom weighted scoring)


✨ Features
✔️ Core Functionality

Add tasks with:

Title

Due date

Estimated hours

Importance (1–10)

Dependencies (auto dropdown)

One-click “Analyze Tasks” → returns sorted list

Each result includes:

Calculated score

Explanation (importance, urgency, effort, dependencies)


✔️ Frontend (React + Vite)

Clean UI with guide page + analyzer page

Date picker

Multi-select dependency dropdown

Responsive layout

Toast notifications and loading states

✔️ Backend (Django + DRF)

/api/tasks/analyze/ (POST)

/api/tasks/suggest/ (POST) – top 3 tasks for the day

Circular dependency detection

CORS enabled

Render deployment

🏗️ Tech Stack
Frontend

React (Vite)

Axios

React Select

React DatePicker

CSS-in-JS inline styling

Backend

Django 4.2

Django REST Framework

Django CORS Headers

Python 3.10+

Deployment

Render Web Service (Backend)

Render Static Site (Frontend)
