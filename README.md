# CampusGig • Student Freelance Marketplace

CampusGig is a next-generation campus-focused freelance marketplace designed specifically for university students. It empowers students to offer services, build their portfolios, and earn income safely through escrow-protected transactions and verified student credentials.

---

## 🌟 Key Features

- **🎓 Verified Student Badges**: Student credential & student ID card verification to ensure trusted campus connections.
- **💼 Gig Services & Custom Orders**: Browse student offerings in Web Development, Graphic Design, Content Writing, Tutoring, Video Editing, and more.
- **📋 Job Board & Proposals**: Clients can post custom project listings; students submit tailored proposals and pricing.
- **🔒 Escrow Protection & Wallet**: Safe milestone and escrow payments with automated platform commission and instant wallet balance management.
- **💬 Real-Time Chat & Collaboration**: Live messaging powered by Socket.IO with file attachments and project discussion.
- **⭐ Reviews & Ratings**: Transparent client and freelancer reviews after order completion.
- **🛡️ Admin Dashboard**: Role-based access for moderating verification requests, managing users, dispute reports, and system settings.
- **🔐 Modern Authentication**: JWT authentication, Google OAuth 2.0 sign-in, email verification (SMTP), and phone SMS OTP verification (Twilio).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, Multer, Bcrypt, JSON Web Tokens
- **Database**: Relational In-Memory JSON store with auto-persistence and seed support
- **Integrations**: Google OAuth 2.0, Nodemailer, Twilio SMS API

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies for the root, backend, and frontend:

```bash
# Clone the repository
git clone https://github.com/<your-username>/student-freelance-marketplace.git
cd student-freelance-marketplace

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update the values:
```bash
PORT=5000
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="CampusGig Verification <noreply@campusgig.edu>"
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

#### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local`:
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Database Seeding
Seed the database with sample categories, services, and student profiles:

```bash
cd backend
npm run seed
```

### 5. Running the Application

From the root project directory:
```bash
# Terminal 1: Run Backend
npm run dev:backend

# Terminal 2: Run Frontend
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 License
This project is licensed under the MIT License.
