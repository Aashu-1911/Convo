# Signup Implementation Documentation

## Overview
This document details the complete implementation of the user signup functionality in the Chat Web application backend, from database connection to user creation and authentication.

---

## Project Structure

```
backend/
├── src/
│   ├── server.js                    # Express server configuration
│   ├── db/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   └── User.model.js            # User schema and password hashing
│   ├── controllers/
│   │   └── auth.controller.js       # Signup logic and validation
│   └── routes/
│       └── auth.route.js            # Authentication routes
└── package.json                     # Dependencies
```

---

## Step-by-Step Implementation

### 1. **Dependencies Installation**

**File:** `package.json`

Installed the following packages:
- `express` (v5.2.1) - Web framework
- `mongoose` (v9.0.2) - MongoDB ODM
- `bcryptjs` (v3.0.3) - Password hashing
- `jsonwebtoken` (v9.0.3) - JWT token generation
- `dotenv` (v17.2.3) - Environment variables
- `cookie-parser` (v1.4.7) - Cookie handling
- `cors` (v2.8.5) - Cross-origin resource sharing
- `nodemon` (v3.1.11) - Development auto-reload

---

### 2. **Database Connection**

**File:** `src/db/db.js`

Created a MongoDB connection function:
```javascript
import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch(error){
        console.error("Error connecting to the database:",error)
        process.exit(1);
    }
}
```

**Features:**
- Async connection to MongoDB Atlas
- Error handling with process exit on failure
- Logs successful connection with host information

---

### 3. **User Model Creation**

**File:** `src/models/User.model.js`

Created a comprehensive user schema with:

**Schema Fields:**
- `fullName` (String, required) - User's full name
- `email` (String, required, unique) - User's email address
- `password` (String, required, min 8 characters) - Hashed password
- `bio` (String, optional) - User biography
- `profilePic` (String, optional) - Profile picture URL
- `nativLanguage` (String, optional) - Native language
- `learningLanguage` (String, optional) - Language being learned
- `location` (String, optional) - User location
- `isOnboarded` (Boolean, default: false) - Onboarding status
- `friends` (Array of ObjectIds) - References to other users
- `timestamps` (auto-generated) - createdAt and updatedAt

**Password Hashing Middleware:**
```javascript
userSchema.pre("save", async function (){
    if(!this.isModified("password")){
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
```

**Key Points:**
- Pre-save hook automatically hashes passwords before storing
- Only hashes if password is new or modified (not on every save)
- Uses bcryptjs with salt rounds of 10 for security
- Async function without `next` callback (Mongoose async middleware pattern)

---

### 4. **Signup Controller**

**File:** `src/controllers/auth.controller.js`

Implemented the signup logic with comprehensive validation:

**Validation Steps:**
1. **Required Fields Check:**
   - Validates email, password, and fullName are provided
   - Returns 400 error if any field is missing

2. **Password Length Validation:**
   - Ensures password is at least 8 characters
   - Returns 400 error for short passwords

3. **Email Format Validation:**
   - Uses regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Returns 400 error for invalid email format

4. **Duplicate Email Check:**
   - Queries database for existing user with same email
   - Returns 400 error if email already registered

**User Creation Process:**
1. Generates random avatar (1-100) from `https://avatar.iran.liara.run/public/`
2. Creates new user with User.create():
   - Email
   - Password (automatically hashed by pre-save hook)
   - Full name
   - Random profile picture

**JWT Token Generation:**
- Generates token with user ID as payload
- Uses `JWT_SECRET_KEY` from environment variables
- Sets expiration to 7 days
- Signs token with jsonwebtoken library

**Cookie Setting:**
```javascript
res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 1000,    // 7 days in milliseconds
    httpOnly: true,                 // Prevents XSS attacks
    sameSite: "strict",             // CSRF protection
    secure: process.env.NODE_ENV==="production" // HTTPS only in production
})
```

**Success Response:**
- Status: 201 (Created)
- Returns user object and success flag

---

### 5. **Routes Configuration**

**File:** `src/routes/auth.route.js`

Set up authentication routes:
```javascript
import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

export default router;
```

**Endpoint:** `POST /api/auth/signup`

---

### 6. **Server Setup**

**File:** `src/server.js`

Configured Express server:
```javascript
import express from "express"
import "dotenv/config";
import authRoutes from './routes/auth.route.js';
import {connectDB} from './db/db.js';

const app = express();
const PORT = process.env.PORT

app.use(express.json());           // Parse JSON request bodies
app.use("/api/auth", authRoutes)   // Mount auth routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()                     // Connect to MongoDB on server start
})
```

**Features:**
- JSON body parsing middleware
- Route mounting at `/api/auth` prefix
- Database connection on server startup
- Runs on port defined in environment variables

---

## Environment Variables

**Required in `.env` file:**
```
PORT=6001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET_KEY=<your_secret_key>
NODE_ENV=development
```

---

## API Endpoint Testing

### Signup Endpoint

**URL:** `POST http://localhost:6001/api/auth/signup`

**Request Body:**
```json
{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Success Response (201):**
```json
{
    "successd": true,
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "email": "john@example.com",
        "profilePic": "https://avatar.iran.liara.run/public/42.png",
        "bio": "",
        "nativLanguage": "",
        "learningLanguage": "",
        "location": "",
        "isOnboarded": false,
        "friends": [],
        "createdAt": "2025-12-25T10:30:00.000Z",
        "updatedAt": "2025-12-25T10:30:00.000Z"
    }
}
```

**Error Responses:**

1. Missing Fields (400):
```json
{
    "message": "All fields are required"
}
```

2. Short Password (400):
```json
{
    "message": "Password must be at least 8 characters long"
}
```

3. Invalid Email (400):
```json
{
    "message": "Invalid email format"
}
```

4. Duplicate Email (400):
```json
{
    "message": "Email is already registered"
}
```

---

## Security Features Implemented

1. **Password Hashing:**
   - Passwords never stored in plain text
   - Bcrypt with salt rounds = 10
   - Automatic hashing via Mongoose middleware

2. **JWT Authentication:**
   - Secure token generation
   - 7-day expiration
   - Stored in HTTP-only cookies

3. **Cookie Security:**
   - httpOnly flag prevents XSS
   - sameSite="strict" prevents CSRF
   - Secure flag for HTTPS in production

4. **Input Validation:**
   - Email format validation
   - Password length requirement
   - Duplicate email prevention

---

## Issues Fixed During Development

### Error: "TypeError: next is not a function"

**Problem:**
The password hashing middleware was using `async` function with `next` callback:
```javascript
userSchema.pre("save", async function (next){
    // ... code
    next();
})
```

**Solution:**
Removed `next` parameter and calls since Mongoose automatically handles async middleware:
```javascript
userSchema.pre("save", async function (){
    // ... code
})
```

**Reason:** In Mongoose, async functions in middleware don't require the `next` callback. Using both async/await and `next()` causes conflicts.

---

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required variables

3. Start development server:
```bash
npm run dev
```

4. Server will run on the specified PORT (6001)

5. Test with Postman at: `http://localhost:6001/api/auth/signup`

---

## Next Steps / TODO

- [ ] Implement Stream Chat user creation (marked as TODO in controller)
- [ ] Add email verification
- [ ] Implement password reset functionality
- [ ] Add rate limiting for signup attempts
- [ ] Add more comprehensive error logging

---

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment configuration

---

**Date Implemented:** December 25, 2025  
**Status:** ✅ Fully functional and tested
