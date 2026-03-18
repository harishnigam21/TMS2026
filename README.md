# 🧠 Task Management System (TMS)

A full-stack Task Management System built using modern technologies. This project demonstrates a clean architecture with a scalable backend and a responsive frontend dashboard.

---

## 🚀 Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- JWT Authentication

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS

---

## ✨ Features

### 🔐 Authentication

- User Registration
- User Login (JWT-based authentication)

### 📋 Task Management

- Create Task
- View All Tasks
- Toggle Task Completion (Completed / Pending)
- Delete Task

### 🎯 Dashboard UI

- Clean and modern interface
- Real-time task updates (UI state)
- Minimal and intuitive UX
- Responsive design

---

## 📁 Project Structure

backend/
├ src/
│ ├ config/ # Prisma & environment config
│ ├ controllers/ # Route handlers
│ ├ middlewares/ # Auth middleware (JWT)
│ ├ routes/ # API routes
│ ├ types/ # TypeScript types
│ └ server.ts # Entry point
│
├ prisma/
│ ├ schema.prisma
│ └ migrations/

frontend/
├ app/
├ components/
└ styles/

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```
git clone <your-repo-url>
cd TMS2026
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

#### Create `.env` file:

```generate them as per requirements
DATABASE_URL="mysql://user:password@localhost:3306/tms"
JWT_SECRET="your_secret_key"
```

#### Run Prisma

```
npx prisma generate
npx prisma migrate dev
```

#### Start Backend

```
npm run dev
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

### Auth

```
POST   /auth/register
POST   /auth/login
PATCH   /auth/logout
PATCH   /auth/refresh <later will be change to GET>
```

### Tasks

```
GET    /tasks
POST   /tasks
PATCH  /tasks/:id/toggle      # Toggle completed
PATCH  /tasks/:id/note      # Add note to task
DELETE /tasks/:id
```

---

## 🔒 Security

- JWT-based authentication
- Protected routes using middleware
- User-specific task access (no cross-user access)
- Short Live token as access token and Long Live token as refresh token,
  **\*\*\*\*** /auth/refresh will silently run when token expires, it will regenerate access token if user is valid and continue the request again, so the user request doesn't break

---

## 🧩 Future Improvements

- Real-time updates (WebSockets)
- Notifications system
- Drag & drop task ordering
- Dark mode 🌙

---

## 📸 Preview

```


```

                         🏠
                   Task Dashboard

🔍 Search Here... ➕ Add new task... [ + ]

[ Complete ] [ Incomplete ] Clear Filters

┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────┐
│ ✔ Use TypeScript throughout │ │ ✔ Use an ORM (Prisma) │ │ ✔ Main task API endpoint │
│ about 21 hours ago │ │ about 21 hours ago │ │ about 21 hours ago │
└───────────────────────────────┘ └───────────────────────────────┘ └───────────────────────────────┘

┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────┐
│ ✔ Show simple notifications │ │ ✔ Refresh token (long-lived) │ │ ○ Implement UI + forms │
│ about 21 hours ago │ │ about 21 hours ago │ │ about 21 hours ago │
└───────────────────────────────┘ └───────────────────────────────┘ └───────────────────────────────┘

┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────┐
│ ✔ Implement UI + forms │ │ ✔ Proper validation │ │ ✔ Standard HTTP status codes │
│ about 21 hours ago │ │ about 21 hours ago │ │ about 21 hours ago │
└───────────────────────────────┘ └───────────────────────────────┘ └───────────────────────────────┘

                 [ 1 ]   [ 2 ]   [ 3 ]   ▶

```

***Click on task title to expand them, that will shown remove button and add task note options.


```

---

## 🧑‍💻 Author

Built with ❤️ by Harish Nigam

---

## 📄 License

This project is open-source and available under the MIT License.
