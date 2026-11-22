# MERN Authentication Complete Guide

### JWT, Email Verification, OTP, Forgot Password & Change Password

A full-stack authentication system built with the MERN stack. Users can sign up, verify their email through a tokenized link, log in with JWT access and refresh tokens, reset a forgotten password with a 6-digit email OTP, and set a new password. Protected pages are only available to logged-in users.

---

## Features

- **Signup** with hashed passwords (bcrypt)
- **Email verification** link sent through Nodemailer (Handlebars HTML template)
- **Login** with JWT access token (10 minutes) and refresh token (10 days)
- **Session handling**: one active session per user (old session is replaced on login)
- **Logout** that clears the session
- **Forgot password** with a 6-digit OTP sent by email (valid for 10 minutes)
- **OTP verification** step
- **Change password** after OTP verification
- **Protected routes** on the frontend (redirects to `/login` if not authenticated)
- **Global user state** with React Context
- Toast notifications and a clean UI built with shadcn/ui and Tailwind CSS

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Tailwind CSS and shadcn/ui
- Axios
- Sonner (toast notifications)
- Lucide React (icons)

**Backend**
- Node.js and Express.js
- MongoDB and Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcrypt
- Nodemailer and Handlebars
- dotenv and cors

---

## Authentication Flows

### 1. Signup and Email Verification

```
Signup form  ->  POST /user/register
                   |- hash password (bcrypt)
                   |- create user (isVerified = false)
                   |- create verification JWT (10 min)
                   '- email a link:  <FRONTEND_URL>/verify/<token>

User clicks link ->  /verify/:token (React)
                   |- useParams() reads the token
                   '- POST /user/verify  (Authorization: Bearer <token>)
                        '- user.isVerified = true  ->  redirect to /login
```

### 2. Login

```
POST /user/login
  |- checks email and password
  |- blocks login if the email is not verified
  |- replaces any old session with a new one
  '- returns accessToken (10m), refreshToken (10d) and the user
```

### 3. Forgot Password

```
/forgot-password   ->  POST /user/forgot-password    (6-digit OTP emailed, valid 10 min)
/verify-otp/:email ->  POST /user/verify-otp/:email  (OTP checked, then cleared)
/change-password/:email -> POST /user/change-password/:email  (new password hashed and saved)
```

---

## Project Structure

```
NotesApp/
|-- client/                         # React frontend (Vite)
|   `-- src/
|       |-- components/
|       |   |-- Navbar.jsx
|       |   |-- Hero.jsx
|       |   `-- ProtectedRoute.jsx
|       |-- context/
|       |   `-- UserContext.jsx     # user state (ContextProvider, getData)
|       |-- pages/
|       |   |-- Home.jsx
|       |   |-- Signup.jsx
|       |   |-- Login.jsx
|       |   |-- VerifyEmail.jsx     # "Check your email" screen
|       |   |-- Verify.jsx          # reads token from URL and verifies
|       |   |-- ForgotPassword.jsx
|       |   |-- VerifyOTP.jsx
|       |   `-- ChangePassword.jsx
|       |-- App.jsx                 # routes
|       `-- main.jsx
`-- server/                         # Express backend
    |-- controllers/
    |   `-- userController.js       # register, verification, login, logout, OTP, password
    |-- models/
    |   |-- userModel.js
    |   `-- sessionModel.js
    |-- emailVerify/
    |   |-- verifyMail.js           # verification email
    |   |-- sendOtpMail.js          # OTP email
    |   `-- template.hbs            # Handlebars email template
    `-- ...                         # routes, middleware, db config, index.js
```

---

## Frontend Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Protected (logged-in users only) |
| `/signup` | Signup | Public |
| `/login` | Login | Public |
| `/verify` | "Check your email" screen | Public |
| `/verify/:token` | Email verification | Public (opened from the email link) |
| `/forgot-password` | Request OTP | Public |
| `/verify-otp/:email` | Enter OTP | Public |
| `/change-password/:email` | Set new password | Public |
| `*` | 404 page | Public |

---

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/register` | Create account and send verification email |
| POST | `/user/verify` | Verify email (`Authorization: Bearer <token>`) |
| POST | `/user/login` | Login and receive access and refresh tokens |
| POST | `/user/logout` | Logout and delete the session (authenticated) |
| POST | `/user/forgot-password` | Send a 6-digit OTP to the user's email |
| POST | `/user/verify-otp/:email` | Verify the OTP |
| POST | `/user/change-password/:email` | Set a new password |

**Example: register**

```json
POST /user/register
{
  "username": "nayab",
  "email": "nayab@example.com",
  "password": "your-password"
}
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A MongoDB database (local or MongoDB Atlas)
- A Gmail account with an **App Password** for sending emails

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd NotesApp
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
```

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:3000
```

Start the app:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

### 4. CORS

The backend must allow the frontend origin, and `cors` must be registered **before** the routes:

```js
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
```

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `PORT` | server | Port the API runs on |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret used to sign and verify JWTs |
| `MAIL_USER` | server | Gmail address used to send emails |
| `MAIL_PASS` | server | Gmail App Password (not your normal password) |
| `VITE_API_URL` | client | Base URL of the backend API |

> Never commit `.env` files. Add them to `.gitignore`.

---

## How the Email Verification Link Works

The backend creates the JWT and injects it into the email template:

```js
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });
verifyMail(token, email);
```

The Handlebars template places the token in the link:

```html
<a href="http://localhost:5173/verify/{{token}}">Verify Email</a>
```

React Router reads it back from the URL:

```jsx
<Route path="/verify/:token" element={<Verify />} />

const { token } = useParams();
```

The token is then sent to the backend in the `Authorization: Bearer` header.

---

## Common Issues

| Problem | Fix |
|---|---|
| `ERR_CONNECTION_REFUSED` | The backend is not running, or the frontend is using the wrong port |
| CORS error | Add `cors` middleware before the routes and allow `http://localhost:5173` |
| `getData(...) is null` | Wrap `<App />` in `<ContextProvider>` in `main.jsx` and keep the import path spelling identical everywhere |
| Form submit reloads the page | Use `async (e) => { e.preventDefault(); ... }` in the submit handler |
| Verification fails | Check the frontend API port, and that the token has not expired (10 minutes) |
| Email not sent | Use a Gmail App Password and check `MAIL_USER` and `MAIL_PASS` |
| 404 on change password | Do not put `:` in the frontend URL: use `/change-password/${email}` |

---

## Security Notes and Future Improvements

- Require proof of a verified OTP (for example, a short-lived reset token) before allowing a password change
- Rate-limit login, OTP, and forgot-password endpoints
- Hash the OTP before storing it
- Do not return the full user object (hide the password hash and tokens) in API responses
- Store tokens in `httpOnly` cookies instead of `localStorage`
- Add refresh-token rotation and an auto-refresh flow on the frontend
- Add input validation (for example, Zod or express-validator)

---

## Author

**Nayab Shafique**
- GitHub: [nayab-shafiq-sudo](https://github.com/nayab-shafiq-sudo)
- LinkedIn: [nayab-shafiq-sudo](https://linkedin.com/in/nayab-shafiq-sudo)

---

