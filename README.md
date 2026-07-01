# Learning Management System (LMS)

A modern **Learning Management System (LMS)** built with **React, TypeScript, Vite, Tailwind CSS, and Supabase**. The platform enables students to enroll in courses, access learning materials, complete assignments, track their progress, and communicate with instructors through a secure, responsive, and user-friendly interface.

---

# Internship Details

| Field             | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intern ID**     | CITS5513  |                                                                                                                                                                                                                                                                                                                                                                                                                                            
| **Full Name**     | Anup Kumar   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **No. of Weeks**  | 6 Weeks |                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Project Name**  | Learning Management System |                                                                                                                                                                                                                                                                                                                                                                                                                                                
| **Project Scope** | Developed a full-stack Learning Management System that enables students to enroll in courses, access learning materials, watch video lectures, submit assignments, track learning progress, and view grades. The platform allows instructors to create and manage courses, upload resources, evaluate assignments, and monitor student performance, while administrators manage users, courses, and overall platform activities using secure authentication and Supabase integration. |

---

# Project Overview

The **Learning Management System (LMS)** is a web-based platform designed to simplify online education by providing a centralized environment for students, instructors, and administrators. The application uses **Supabase** for authentication and PostgreSQL database management, while **React**, **TypeScript**, and **Vite** provide a fast and responsive frontend.

---

# Features

## Student Features

* User Registration and Login
* Secure Authentication
* Browse Available Courses
* Search Courses
* Course Enrollment
* View Course Details
* Access Learning Materials
* Watch Video Lectures
* Download Study Resources
* Submit Assignments
* Track Learning Progress
* View Grades
* View Assignment Status
* Update Profile

---

## Instructor Features

* Instructor Registration
* Instructor Login
* Instructor Dashboard
* Create Courses
* Edit Course Information
* Upload Learning Materials
* Upload Video Lectures
* Create Assignments
* Grade Student Submissions
* Monitor Student Progress
* Manage Course Content

---

## Admin Features

* Admin Dashboard
* Manage Students
* Manage Instructors
* Manage Courses
* Manage Categories
* User Management
* Platform Analytics
* Generate Reports
* Monitor Platform Activity
* System Configuration

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router DOM
* Lucide React

## Backend Service

* Supabase

## Database

* PostgreSQL (Supabase)

## Development Tools

* ESLint
* PostCSS
* npm

---

# Project Structure

```text
Learning-Management-System/

├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   ├── integrations/
│   ├── App.tsx
│   └── main.tsx
│
├── supabase/
│   └── migrations/
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/Anupkumar0845/learning-management-system.git

cd learning-management-system
```

---

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a **.env** file in the project root directory.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Never commit your `.env` file or sensitive credentials to GitHub.

---

# Running the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# Build for Production

```bash
npm run build
```

---

# Preview the Production Build

```bash
npm run preview
```

---

# Available Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Create a production build    |
| `npm run preview`   | Preview the production build |
| `npm run lint`      | Run ESLint                   |
| `npm run typecheck` | Check TypeScript types       |

---

# Core Modules

* Authentication
* Student Dashboard
* Instructor Dashboard
* Admin Dashboard
* Course Management
* Course Enrollment
* Lesson Management
* Assignment Management
* Progress Tracking
* Grade Management
* User Profile
* Responsive User Interface
* Supabase Integration

---

# Supabase Integration

Supabase is used for:

* User Authentication
* PostgreSQL Database
* Database Migrations
* Backend APIs
* Secure Data Management
* Real-time Database Operations

Database migration files are located in:

```
supabase/migrations/
```

---

# Future Enhancements

* Live Video Classes
* AI Learning Assistant
* Online Quizzes
* Certificate Generation
* Discussion Forums
* Course Reviews & Ratings
* Email Notifications
* Push Notifications
* Multi-language Support
* Dark Mode
* Mobile Application
* Payment Gateway Integration

---

# Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# License

This project is intended for educational and internship purposes.

---

# Author

**Anup Kumar**

**B.Tech – Information Technology**

**Rajkiya Engineering College Banda**

**Dr. A.P.J. Abdul Kalam Technical University (AKTU)**

