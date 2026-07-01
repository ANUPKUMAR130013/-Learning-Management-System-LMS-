# Library Management System

A modern **Library Management System** built with **React, TypeScript, Vite, Tailwind CSS, and Supabase**. The application helps librarians manage books, members, book issues, returns, reservations, fines, and reports through a secure and user-friendly interface.

---

# Internship Details

| Field | Details |
|--------|---------|
| **Intern ID** |  CITS5513|
| **Full Name** | Anup Kumar |
| **No. of Weeks** | 6 Weeks  |
| **Project Name** | Library Management System |
| **Project Scope** | Designed and developed a full-stack Library Management System that enables librarians to manage books, members, book issuing and returning, reservations, fine calculations, and report generation. The project includes secure authentication, role-based access control, responsive user interface, real-time database integration using Supabase, and efficient library administration. |

---

# Project Overview

The **Library Management System** is a web-based application developed to automate the daily operations of a library. It provides separate dashboards for **Members**, **Librarians**, and **Administrators**, allowing efficient management of books, users, borrowing records, returns, reservations, and fines. The system uses **Supabase** for authentication and PostgreSQL database services, while **React**, **TypeScript**, and **Vite** provide a fast, secure, and responsive frontend experience.

## Features

### Member Features
- User Registration and Login
- Secure Authentication
- Browse Available Books
- Search Books
- Reserve Books
- Borrow Books
- Return Books
- View Borrowing History
- Track Due Dates
- View Fine Details
- Update Profile

### Librarian Features
- Librarian Login
- Add New Books
- Update Book Information
- Delete Books
- Manage Book Inventory
- Issue Books
- Accept Returns
- Manage Reservations
- Generate Reports

### Admin Features
- Admin Dashboard
- Manage Users
- Manage Librarians
- Manage Members
- Manage Categories
- Library Analytics
- System Configuration
- Activity Logs

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React

### Backend Service
- Supabase

### Database
- PostgreSQL (Supabase)

### Development Tools
- ESLint
- PostCSS
- npm

## Project Structure

```text
Library-Management-System/

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

## Installation

```bash
git clone https://github.com/Anupkumar0845/library-management-system.git

cd library-management-system

npm install

npm run dev
```

The application will run at:

```
http://localhost:5173
```

## Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Never upload your `.env` file to GitHub.

## Core Modules

- Authentication
- Member Dashboard
- Librarian Dashboard
- Admin Dashboard
- Book Management
- Borrow & Return Management
- Reservation Management
- Fine Management
- Reports & Analytics
- User Profile

## Future Enhancements

- QR Code Book Issue
- Barcode Scanner
- E-Book Management
- AI Book Recommendation
- Email Notifications
- SMS Alerts
- Dark Mode
- Mobile Application

## License

This project is developed for educational and internship purposes.

## Author

**Anup Kumar**

B.Tech – Information Technology

Rajkiya Engineering College Banda

Dr. A.P.J. Abdul Kalam Technical University (AKTU)

GitHub: https://github.com/Anupkumar0845
