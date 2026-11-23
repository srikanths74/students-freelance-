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

## 🌐 Deployment (Frontend & Backend)

### Method 1: Unified Full-Stack on Render (Recommended • Free Tier)

Deploy both the backend API and built React frontend together on Render with zero CORS setup:

1. Sign in to **[Render.com](https://dashboard.render.com/)** with your GitHub account.
2. Click **New +** > **Web Service**.
3. Select your repository: `students-freelance-`.
4. Configure the settings:
   - **Name**: `students-freelance`
   - **Environment**: `Node`
   - **Region**: Any (e.g., Oregon or Frankfurt)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(Click Generate or enter a random secure string)*
   - `GOOGLE_CLIENT_ID`: *(Optional: your Google OAuth client ID)*
   - `GOOGLE_CLIENT_SECRET`: *(Optional: your Google OAuth secret)*
   - `SMTP_USER`: *(Optional: your Gmail/email address)*
   - `SMTP_PASS`: *(Optional: your Gmail App password)*
6. Click **Deploy Web Service**.
7. Render will install dependencies, build the React frontend, seed initial data automatically, and give you a live HTTPS URL (e.g. `https://students-freelance.onrender.com`).

---

### Method 2: Vercel (Frontend) + Render (Backend)

If you prefer hosting the React frontend on Vercel:

1. **Deploy Backend on Render**:
   - Follow steps above with Root Directory set to `backend`, Build Command: `npm install`, Start Command: `npm start`.
   - Copy your Render backend URL (e.g. `https://students-freelance-api.onrender.com`).
2. **Deploy Frontend on Vercel**:
   - Go to **[vercel.com](https://vercel.com/)** > **Add New Project** > import `students-freelance-`.
   - Set **Root Directory** to `frontend`.
   - Under **Environment Variables**, add:
     - `VITE_API_BASE_URL`: `https://students-freelance-api.onrender.com`
   - Click **Deploy**.

---

## 📜 License
This project is licensed under the MIT License.
