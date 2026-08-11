# EventHub - College Event Management & Student Engagement Platform

EventHub is a modern, responsive full-stack web application designed for organizing, registering, and managing college events (such as hackathons, fests, seminars, and workshops). It features automatic PDF certificate generation with scannable verification QR codes and serial numbers.

## 🚀 Key Features

* **Student Portal**: Discover events, register, view registration history, earn achievement badges, and download participation certificates.
* **Admin Dashboard**: Create and edit event entries, monitor registrations, track analytics trends via visual charts, verify student attendance, and issue certificates.
* **Certificate Engine**: Generates professional PDF certificates complete with unique serial numbers and scannable QR verification codes.
* **Public Verification**: A public verification page allowing anyone to scan a certificate QR code to check its authenticity.
* **Dual-Mode Database**: Supports MongoDB connection out-of-the-box, with a local JSON file-based mock database fallback for immediate offline testing.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, React Router, Tailwind CSS v3, Recharts, Lucide Icons, Axios.
* **Backend**: Node.js, Express.js, JWT Auth, PDFKit, QRCode.
* **Database**: MongoDB (Mongoose ORM) with a local JSON file database fallback.

---

## 📁 Folder Structure

```
College Event management/
├── package.json               # Root scripts to run backend and frontend concurrently
├── backend/                   # Node.js + Express API server
│   ├── config/                # DB setup (MongoDB & JSON fallback adapter)
│   ├── controllers/           # Auth, Event, Registration, Certificate business logic
│   ├── middleware/            # Auth and Admin role guards
│   ├── models/                # Schema abstraction layer
│   ├── routes/                # API router endpoints
│   ├── utils/                 # PDF and QR code generator scripts
│   ├── data/                  # Local fallback JSON files (created on startup)
│   ├── package.json
│   └── seed.js                # Database seeder script
└── frontend/                  # React + Vite client app
    ├── src/
    │   ├── components/        # Sidebar, Navbar, shared layouts
    │   ├── context/           # Auth state manager
    │   ├── pages/             # Dashboard, Events, Details, Registrations, Profile, Verification
    │   ├── index.css          # Tailwind base & theme imports
    │   └── App.jsx            # Routing and layouts shell
    └── package.json
```

---

## 🏃 Getting Started

### 1. Install Dependencies
Run the installation script from the root directory to install packages for both frontend and backend:
```bash
npm run install-all
```

### 2. Seed Database
Initialize the database with sample users, events, registrations, and certificates:
```bash
npm run seed
```
*Note: This creates local JSON data files under `backend/data/` if no MongoDB URI is specified.*

### 3. Run Development Servers
Start both the backend API and frontend Vite servers concurrently with a single command:
```bash
npm run dev
```
* The frontend will open at: **`http://localhost:5173`**
* The backend API runs at: **`http://localhost:5000`**

---

## 🔑 Demo Login Credentials

For testing the dashboards, you can use these seeded credentials:

### Student Account:
* **Email**: `rachana.j@example.com`
* **Password**: `student123`

### Admin/Organizer Account:
* **Email**: `admin@college.edu`
* **Password**: `admin123`

---

## ⚙️ Configuration (Optional)

To connect the application to a live MongoDB instance, create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_custom_jwt_secret_here
```
When `MONGODB_URI` is supplied, Mongoose will automatically connect to your cloud database instead of the JSON database.
