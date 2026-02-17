# GST Inventory System

A modern, responsive inventory management system with real-time syncing, offline support, and mobile optimization.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Prisma (ORM)
- **Database**: MongoDB
- **Styling**: Vanilla CSS + Tailwind

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Account](https://www.mongodb.com/cloud/atlas) (or local MongoDB instance)

### 2. Database Setup
1. Create a MongoDB database (e.g., via MongoDB Atlas).
2. Copy your connection string.

### 3. Backend Configuration
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add the following:
   ```env
   PORT=5000
   DATABASE_URL="your_mongodb_connection_string"
   JWT_SECRET="your_secure_secret_key"
   
   # Email Configuration (for password resets/notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL="Inventory System <your_email@gmail.com>"
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### 4. Frontend Configuration
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (if needed) for the API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## 💻 Development

### Run Backend
```bash
cd backend
npm run dev
```

### Run Frontend
```bash
cd frontend
npm run dev
```

---

## 📦 Deployment Guide

### Backend Production
1. Ensure all environment variables are set in your hosting provider (e.g., Heroku, DigitalOcean, Vercel).
2. Start the production server:
   ```bash
   cd backend
   npm start
   ```

### Frontend Production
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the contents of the `dist` folder to your static hosting provider (e.g., Vercel, Netlify, AWS S3).

---

## 📱 Mobile Support
The system is fully responsive. For mobile devices:
- Access the dashboard via your server's public IP/Domain.
- The UI will automatically adjust or prompt you to access features via the **Mobile Inventory Hub**.
