# 🚀 Safety Compliance Backend (NestJS)

## 📌 Overview

This is the backend service for the **Safety Compliance & Risk Management Platform**.

It handles:

* Authentication & Authorization
* Issue/Risk Management
* Workflow Enforcement
* Audit Logging
* Dashboard APIs
* File Uploads

---

## 🧠 Architecture

The backend follows a **modular architecture** using NestJS:

```
modules/
  auth/
  users/
  issue/
  audit/
  location/
common/
  jwt/
  roles/
```

### Key Concepts

* **REST API design**
* **JWT Authentication**
* **RBAC (Role-Based Access Control)**
* **Workflow Engine**
* **Audit Logging System**
* **Hierarchical Data Handling**

---

## 🛠️ Tech Stack

* Framework: NestJS
* Language: TypeScript
* Database: MySQL
* ORM: TypeORM
* Authentication: JWT
* File Upload: Multer

---

## 🔐 Authentication & Security

* JWT-based login system
* Role-based access:

  * ADMIN
  * USER
* Account lock after multiple failed login attempts
* Protected routes using Guards

---

## 🔁 Workflow Engine

The system enforces strict issue lifecycle:

```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → APPROVED → CLOSED
```

### Rules:

* Only ADMIN can assign, approve, close
* Only assigned USER can start & resolve
* Invalid transitions are blocked at backend level

---

## 📋 Core Modules

### 1. Issue Module

* Create issue
* Assign issue
* Update status
* Apply filters (status, date, location)
* Pagination support

---

### 2. Audit Module (Bonus Feature)

Tracks all activities:

* LOGIN / FAILED_LOGIN
* ISSUE_CREATED
* ISSUE_ASSIGNED
* STATUS changes

---

### 3. Location Module

Supports hierarchical structure:

```
Location → Sub-location → Area
```

Features:

* Recursive filtering
* Multi-level querying

---

## 📊 Dashboard APIs

Provides data for:

* Total issues
* Issues by status
* Issues by location
* Issues by assignee

---

## 📂 File Upload

* Image upload support for issue evidence
* Stored in `/uploads` folder

---

## ⚙️ Setup Instructions

### 1. Clone repo

```bash
git clone <your-backend-repo>
cd backend
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Create `.env`

```env
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=yourpassword
MYSQLDATABASE=safety_db
JWT_SECRET=your_secret
```

---

### 4. Run project

```bash
npm run start:dev
```

---

## 🌐 API Base URL

```
http://localhost:3000
```

---

## 📦 Important APIs

### Auth

* POST `/auth/login`

### Issues

* GET `/issues`
* POST `/issues`
* POST `/issues/:id/status`
* POST `/issues/:id/assign`

### Dashboard

* GET `/issues/stats`
* GET `/issues/dashboard`

### Audit Logs

* GET `/audit`

---

## 🧪 Testing

Use:

* Postman
* Thunder Client

---

## 📈 Extensibility

This system is designed to support:

* New audit types
* Custom workflows
* Additional roles
* Plugin-based reporting

---

## 🏆 Bonus Features Implemented

✅ RBAC
✅ Audit Logging
✅ File Upload
✅ Pagination
✅ Advanced Filtering
✅ Hierarchical Locations

---

## 📌 Notes

* Ensure MySQL is running
* Ensure `.env` is configured properly
* Restart server after changes

---

## 👨‍💻 Author

Saqeeb – Safety Platform Backend
