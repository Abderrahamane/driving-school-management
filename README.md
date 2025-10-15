# 🏫 Driving School Management System

## 📘 Overview
This is a **web application** for managing a driving school.  
It allows administrators to manage **students, instructors, vehicles, schedules, and payments** through a centralized dashboard.

The system is divided into two main parts:

- **Backend:** Node.js + Express + MongoDB
- **Frontend:** Next.js + React + Tailwind CSS

---

## ⚙️ Project Structure
```
driving-school-management/
│
├── backend/ # Node.js + Express (API + MongoDB)
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── middlewares/
│ └── server.js
│
├── frontend/ # Next.js + React (Admin Dashboard)
│ ├── src/
│ ├── components/
│ └── pages/
│
└── README.md
```

---

## 🚀 How to Run the Project

### 1️⃣ Clone the Repository
```bash
  git clone https://github.com/Abderrahamane/driving-school-management.git
  cd driving-school-management
```
### 2️⃣ Install Dependencies 
- **Backend:**
```bash
  cd backend
  npm install
```
- **Frontend:**
```bash
  cd ../frontend
  npm install
```
### 3️⃣ Run the Project
In two separate terminals:
- **Backend:**
```bash
  cd backend
  npm start
```
- **Frontend:**
```bash
  cd frontend
  npm run dev
```
---
## 👥 Team Collaboration Guidelines

Please follow these steps when contributing to the project.

### 🧩 Step 1: Always Create a New Branch

When you start a new task:
```bash
  git checkout -b feature-<your-task-name>
```

👉 Example:

```bash
  git checkout -b feature-add-student-form
```

### 🧱 Step 2: Add and Commit Your Changes
```bash
  git add .
  git commit -m "Added student form component"
```

### 🚀 Step 3: Push Your Branch
```bash
  git push -u origin feature-add-student-form
```

### ⚠️ Step 4: Never Merge to main Yourself

After pushing your branch, go to GitHub and create a Pull Request (PR).

Do not merge it until Nada (the project leader) reviews and approves it.

---
## 📝 Tasks & Issues

All tasks and bugs will be posted in the Issues section of this repository.

➡️ Each team member should:

- Check the Issues tab regularly.

- Work only on the task assigned to them.

- Create a new branch for each new task.
---
## 💾 Tech Stack

| Area | Technology |
|------|-------------|
| **Frontend** | Next.js, React, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Version Control** | Git + GitHub |

---
## 🧠 Notes

- Keep your code clean and well-commented.

- Use meaningful commit messages.

- Never push directly to main — always use branches.

- If you face any issue, comment under the related GitHub Issue.

--- 
## 👨‍💻 Project Leader

**BELMIOULD Nada:**

Responsible for code review, task assignment, and repository management.
