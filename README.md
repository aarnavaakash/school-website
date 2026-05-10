# HNP Institute of Education - Full Stack Website

A modern, responsive school website built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Features
- **Public Pages**: Home, About, Academics, Admissions, Faculty, Notice Board, Gallery, Contact.
- **Student Dashboard**: View profile, attendance, results, and notices.
- **Admin Dashboard**: Manage notices, teachers, gallery, students, admissions, and messages.
- **Authentication**: JWT based auth with roles (admin, student).
- **Responsive UI**: Built with Tailwind CSS and Framer Motion for animations.

## Tech Stack
- **Frontend**: React (Vite), React Router, Tailwind CSS, Framer Motion, Axios, Lucide React.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs.

## Prerequisites
- Node.js installed
- MongoDB installed (or a MongoDB Atlas URI)

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` (already done by script if followed instructions).
   - Ensure `MONGO_URI` is correct.
4. Seed the database with sample data (Admin & Student):
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   npm start
   # or node server.js
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## Test Credentials
After running `node seed.js`, you can use the following credentials to test the dashboards:

- **Admin Login**:
  - Email: `admin@hnp.edu`
  - Password: `admin123`

- **Student Login**:
  - Email: `john@student.hnp.edu`
  - Password: `student123`

## Directory Structure
- `/backend`: Express API server, MongoDB models, controllers.
- `/frontend`: React application, UI components, pages.
