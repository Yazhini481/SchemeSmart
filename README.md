# 🏛️ Smart Scheme Recommendation Platform

A full-stack application that helps users discover, compare, and evaluate schemes using a combination of recommendation logic, AI-assisted chat, form/document analysis, and eligibility matching.

This project includes:
- ⚙️ a FastAPI backend for data processing and APIs
- 💻 a Next.js frontend for the user interface
- 🔎 scheme browsing and comparison features
- 🎯 recommendation support based on user profile and document data
- 📄 document/form analysis for assisted form completion
- 💬 chatbot-style guidance for user questions

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Environment Configuration](#environment-configuration)
- [API Access](#api-access)
- [Troubleshooting](#troubleshooting)
- [Git & GitHub Setup](#git--github-setup)
- [License](#license)

---

## 📌 Overview

The platform is designed to support users in identifying appropriate schemes and understanding eligibility requirements. It combines structured scheme data, backend logic, and a modern interactive interface to improve decision-making and reduce manual effort.

The application is especially useful for:
- 🔎 scheme discovery
- ✅ eligibility assessment
- ⚖️ comparing alternative opportunities
- 💬 answering user questions through a chatbot
- 📄 extracting relevant details from uploaded forms or documents
- 🧭 providing guided assistance for form completion

---

## ✨ Features

### 🔎 Scheme Discovery

Users can browse schemes from a dataset and view relevant information.

### 🎯 Recommendation Engine

The backend evaluates user data and recommends appropriate schemes based on matching criteria.

### ✅ Eligibility Matching

The system evaluates whether users meet key conditions for a scheme using structured checks.

### 💬 AI Chat Assistant

A chatbot interface helps users ask questions and navigate scheme information more effectively.

### 📊 Comparison Dashboard

Users can compare multiple schemes side by side to assess suitability and benefits.

### 📄 Document and Form Analysis

Uploaded documents or form content can be analyzed to extract key fields and guide the user through required inputs.

### 🧭 Progressive User Guidance

The app is designed to help users review extracted information before final submission or action.

---

## 🏗️ Architecture

```text
Frontend (Next.js)
   |
   | HTTP requests
   v
Backend (FastAPI)
   |
   +--> Routes / API Layer
   +--> Services / Recommendation Logic
   +--> Data Processing and Eligibility Evaluation
   +--> Dataset / Database Access
```

The frontend communicates with the backend through API endpoints, while the backend handles logic for recommendation, form/document processing, and data retrieval.

---

## 🛠️ Tech Stack

### 💻 Frontend

- Next.js
- React
- TypeScript
- CSS Modules / global CSS
- Client-side routing

### ⚙️ Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- Pandas
- NumPy
- scikit-learn
- python-dotenv
- Python multipart support
- OCR/document-related libraries

### 📊 Data

- CSV-based scheme dataset
- SQL database schema
- structured recommendation logic

---

## 📂 Project Structure

```text
SS/
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routes/
│   │   │   ├── chatbot.py
│   │   │   ├── compare.py
│   │   │   ├── documents.py
│   │   │   ├── recommendation.py
│   │   │   └── schemes.py
│   │   ├── services/
│   │   │   ├── chatbot.py
│   │   │   ├── eligibility.py
│   │   │   ├── profile_extraction.py
│   │   │   ├── recommendation.py
│   │   │   └── retrieval.py
│   │   └── utils/
│   │       ├── data_loader.py
│   │       └── inspect_data.py
│   ├── dataset/
│   │   └── Schemes.csv
│   ├── database.sql
│   ├── requirements.txt
│   ├── test_all_endpoints.py
│   ├── test_backend_loader.py
│   ├── test_recommendation.py
│   └── test_retrieval.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── config/
│   │   └── context/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   └── README.md
│
├── .gitignore
├── README.md
└── LICENSE (optional)
```

---

## 💻 Prerequisites

Before running the project, ensure the following are installed on your machine:

- 🐍 Python 3.10+
- 🟢 Node.js 18+
- 📦 npm
- 🔧 Git
- 📝 Optional: Tesseract OCR for full document/image processing support

---

## ⚙️ Backend Setup

### 1. 📁 Open a terminal and go to the backend folder

```bash
cd D:\SS\backend
```

### 2. 🐍 Create a virtual environment

```bash
python -m venv .venv
```

### 3. ▶️ Activate the virtual environment

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. 📦 Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. 🚀 Start the backend

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

This will run the API on:

```text
http://127.0.0.1:8005
```

To verify that it is running, open:

```text
http://127.0.0.1:8005/health
```

> 💡 Use `127.0.0.1` in the browser. `0.0.0.0` is a bind address for the server, not a URL to open in a browser.

---

## 💻 Frontend Setup

### 1. 📁 Open a new terminal and go to the frontend folder

```bash
cd D:\SS\frontend
```

### 2. 📦 Install frontend dependencies

```bash
npm install
```

### 3. 🚀 Start the frontend

```bash
npm run dev
```

The app will usually start at:

```text
http://localhost:3000
```

If port 3000 is busy, Next.js may use another port, such as:

```text
http://localhost:3001
```

---

## 🚀 Running the Application

Run both services:

### ⚙️ Backend

```bash
cd D:\SS\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

### 💻 Frontend

```bash
cd D:\SS\frontend
npm run dev
```

Then open:

- 🌐 Frontend: http://localhost:3000
- ⚙️ Backend: http://127.0.0.1:8005

---

## 🔐 Environment Configuration

The frontend must point to the backend API URL correctly. In most local setups, that is:

```text
http://127.0.0.1:8005
```

If your environment file contains a custom value, ensure it matches the backend URL before launching the frontend.

---

## 🔌 API Access

The backend exposes endpoints for:

- 💬 chat interaction
- 🎯 recommendations
- ⚖️ scheme comparison
- 📄 document analysis
- 📝 form assistance
- ✅ eligibility and retrieval logic

Base endpoint:

```text
http://127.0.0.1:8005
```

---

## 🛠️ Troubleshooting

### 🌐 Browser shows “This site can’t be reached”

This often happens when visiting:

```text
http://0.0.0.0:8005
```

Use this instead:

```text
http://127.0.0.1:8005
```

### 🔌 Frontend cannot connect to backend

Check:

- ⚙️ backend is running
- 🔢 port 8005 is active
- 🔗 API base URL is configured correctly
- 🛡️ there are no firewall or port conflicts

### 🐍 Python dependency errors

Recreate the environment:

```bash
cd D:\SS\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 💻 Frontend dependency or startup errors

Try:

```bash
cd D:\SS\frontend
npm install
npm run dev
```

---

## 🐙 Git & GitHub Setup

### 1. 📁 Initialize repository

```bash
cd D:\SS
git init
git branch -M main
```

### 2. 🚫 Create a .gitignore file

This project should ignore:

- `.venv` folders
- `node_modules`
- build output
- environment files
- OS-specific files

Example:

```gitignore
# Python
backend/.venv/
venv/
__pycache__/
*.pyc
*.pyo
*.pyd

# Node
frontend/node_modules/
frontend/.next/
frontend/out/

# Environment files
.env
.env.local
backend/.env
frontend/.env.local

# OS
.DS_Store
Thumbs.db
```

### 3. 📤 Commit and push

```bash
git add -A
git commit -m "Initial project commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

If the remote already exists:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 📄 License

This project is provided as-is for educational, internal, or project-specific use unless otherwise specified by the project owner.

---

## 📌 Summary

This project combines a modern frontend and a Python backend into a smart scheme recommendation platform with:

- 🔎 user-friendly browsing
- 🎯 recommendation logic
- ✅ eligibility evaluation
- 💬 AI-style chat assistance
- 📄 document/form analysis
- ⚖️ comparison and decision support

For local development, the standard setup is:

- ⚙️ Backend: `backend` with `uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload`
- 💻 Frontend: `frontend` with `npm run dev`

---

If you want, I can also give you:
1. a more concise README for GitHub,
2. a version with badges and screenshots,
3. or a README tailored exactly for your final project presentation.
