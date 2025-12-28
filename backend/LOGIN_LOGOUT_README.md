# Login and Logout Implementation Documentation

## Overview
This document details the complete implementation of the user login and logout functionality in the Chat Web application backend, covering authentication, JWT token validation, and session management.

---

## Project Structure

```
backend/
├── src/
│   ├── server.js                    # Express server configuration
│   ├── db/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   └── User.model.js            # User schema with password comparison
│   ├── controllers/
│   │   └── auth.controller.js       # Login and logout logic
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT authentication middleware
│   └── routes/
│       └── auth.route.js            # Authentication routes
└── package.json                     # Dependencies
```

---

## Step-by-Step Implementation

### 1. **Dependencies Required**

**File:** `package.json`

The following packages are required (should already be installed):
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing and comparison
- `jsonwebtoken` - JWT token generation and verification
- `dotenv` - Environment variables
- `cookie-parser` - Cookie handling

---

### 2. **User Model Password Comparison Method**

**File:** `src/models/User.model.js`

Add a password comparison method to the User schema:

```javascript
import bcrypt from 'bcryptjs';

// After the schema definition, add this method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}
```

**Purpose:**
- Compares plain text password with hashed password
- Uses bcrypt.compare() for secure comparison
- Returns true if passwords match, false otherwise
- Instance method (called on user document)

---

### 3. **Login Controller Implementation**

**File:** `src/controllers/auth.controller.js`

Implement the login function with complete validation and authentication:

```javascript
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 3. Verify password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        // 5. Set cookie with token
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days in milliseconds
            httpOnly: true,                      // Prevents XSS attacks
            sameSite: "strict",                  // CSRF protection
            secure: process.env.NODE_ENV === "production" // HTTPS only in production
        });

        // 6. Return success response (exclude password)
        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio,
                nativLanguage: user.nativLanguage,
                learningLanguage: user.learningLanguage,
                location: user.location,
                isOnboarded: user.isOnboarded,
                friends: user.friends
            }
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
```

**Login Flow:**

1. **Input Validation:**
   - Checks if email and password are provided
   - Returns 400 error if either field is missing

2. **User Lookup:**
   - Searches database for user with provided email
   - Uses generic error message to prevent email enumeration

3. **Password Verification:**
   - Uses comparePassword() method to verify credentials
   - Returns same generic error for invalid password (security best practice)

4. **Token Generation:**
   - Creates JWT with userId as payload
   - Sets 7-day expiration
   - Uses JWT_SECRET_KEY from environment variables

5. **Cookie Setting:**
   - Stores token in httpOnly cookie
   - Prevents JavaScript access (XSS protection)
   - Strict sameSite policy (CSRF protection)
   - Secure flag in production (HTTPS only)

6. **Response:**
   - Returns user data (excluding password)
   - Includes all profile fields
   - Status 200 for successful login

**Security Features:**
- Generic error messages prevent username enumeration
- Password never returned in response
- Secure cookie configuration
- Token expiration for automatic logout

---

### 4. **Logout Controller Implementation**

**File:** `src/controllers/auth.controller.js`

Implement the logout function to clear authentication:

```javascript
export const logout = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie("jwt", "", {
            maxAge: 0,                           // Immediate expiration
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Error in logout controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
```

**Logout Flow:**

1. **Cookie Clearing:**
   - Sets jwt cookie to empty string
   - Sets maxAge to 0 (immediate expiration)
   - Maintains same security flags as login

2. **Response:**
   - Returns success message
   - Status 200 for successful logout

**Note:** In a production environment with a token blacklist, you would also:
- Add the token to a blacklist (Redis/database)
- Implement token refresh rotation
- Consider server-side session management

---

### 5. **Authentication Middleware**

**File:** `src/middleware/auth.middleware.js`

Create middleware to protect routes requiring authentication:

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        // 1. Extract token from cookies
        const token = req.cookies.jwt;

        // 2. Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // 4. Check if token is valid
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }

        // 5. Find user from token payload
        const user = await User.findById(decoded.userId).select("-password");

        // 6. Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 7. Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error("Error in auth middleware:", error);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Token expired"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
```

**Middleware Flow:**

1. **Token Extraction:**
   - Reads JWT from cookies using cookie-parser
   - Checks if token exists

2. **Token Verification:**
   - Verifies token signature using JWT_SECRET_KEY
   - Checks token hasn't been tampered with
   - Validates expiration time

3. **User Lookup:**
   - Extracts userId from token payload
   - Finds user in database
   - Excludes password from result

4. **User Validation:**
   - Ensures user still exists in database
   - Handles case where user was deleted after login

5. **Request Enhancement:**
   - Attaches user object to req.user
   - Makes user data available to route handlers

6. **Error Handling:**
   - Specific errors for invalid/expired tokens
   - Generic 500 for unexpected errors

**Usage in Routes:**
```javascript
// Protecting a route example
router.get("/profile", protectRoute, getProfile);
router.put("/update", protectRoute, updateProfile);
```

---

### 6. **Routes Configuration**

**File:** `src/routes/auth.route.js`

Configure login and logout routes:

```javascript
import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Example of protected route
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

export default router;
```

**Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)

---

### 7. **Server Configuration**

**File:** `src/server.js`

Ensure server has cookie-parser middleware:

```javascript
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import { connectDB } from './db/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());              // Parse JSON bodies
app.use(cookieParser());              // Parse cookies (REQUIRED for login/logout)

// Routes
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
```

**Critical Middleware:**
- `express.json()` - Parses JSON request bodies
- `cookieParser()` - **REQUIRED** for reading/writing cookies

---

### 8. **Environment Variables**

**File:** `.env`

Ensure these variables are set:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key_here
PORT=5000
NODE_ENV=development
```

**Security Notes:**
- `JWT_SECRET_KEY` should be a long, random string
- Never commit `.env` file to version control
- Use different secrets for development and production

---

## API Testing Guide

### Login Request

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "yourpassword123"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "user": {
        "_id": "user_id_here",
        "fullName": "John Doe",
        "email": "user@example.com",
        "profilePic": "https://avatar.iran.liara.run/public/42",
        "bio": "",
        "nativLanguage": "",
        "learningLanguage": "",
        "location": "",
        "isOnboarded": false,
        "friends": []
    }
}
```

**Error Response (400):**
```json
{
    "success": false,
    "message": "Invalid email or password"
}
```

**Cookie Set:**
- Name: `jwt`
- Value: JWT token string
- HttpOnly: true
- Expires: 7 days from login

---

### Logout Request

**Endpoint:** `POST http://localhost:5000/api/auth/logout`

**Request Body:** None required

**Success Response (200):**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

**Cookie Cleared:**
- jwt cookie set to empty with maxAge: 0

---

### Protected Route Request (Get Current User)

**Endpoint:** `GET http://localhost:5000/api/auth/me`

**Headers:** Cookies with valid JWT automatically sent

**Success Response (200):**
```json
{
    "success": true,
    "user": {
        "_id": "user_id_here",
        "fullName": "John Doe",
        "email": "user@example.com",
        "profilePic": "https://avatar.iran.liara.run/public/42",
        // ... other user fields
    }
}
```

**Error Response (401) - No Token:**
```json
{
    "success": false,
    "message": "Unauthorized - No token provided"
}
```

**Error Response (401) - Invalid/Expired Token:**
```json
{
    "success": false,
    "message": "Unauthorized - Token expired"
}
```

---

## Testing with Postman/Thunder Client

### 1. **Login Test:**
   1. Create POST request to `http://localhost:5000/api/auth/login`
   2. Set Body to raw JSON
   3. Add email and password
   4. Send request
   5. Check Cookies tab for jwt cookie

### 2. **Protected Route Test:**
   1. After successful login, cookies are automatically included
   2. Create GET request to `http://localhost:5000/api/auth/me`
   3. Send request (jwt cookie sent automatically)
   4. Should receive user data

### 3. **Logout Test:**
   1. Create POST request to `http://localhost:5000/api/auth/logout`
   2. Send request
   3. Check Cookies tab - jwt should be cleared
   4. Try accessing protected route - should fail with 401

---

## Security Best Practices Implemented

### 1. **Password Security:**
- Passwords hashed with bcrypt (10 salt rounds)
- Plain text passwords never stored
- Password not returned in API responses
- Secure comparison using bcrypt.compare()

### 2. **Token Security:**
- HttpOnly cookies prevent XSS attacks
- SameSite: strict prevents CSRF attacks
- Secure flag in production (HTTPS only)
- 7-day expiration for automatic logout
- Token verified on every protected request

### 3. **Error Handling:**
- Generic error messages prevent email enumeration
- No stack traces exposed to client
- Proper HTTP status codes
- Consistent error response format

### 4. **Authentication Flow:**
- Stateless JWT authentication
- No server-side session storage needed
- Token contains minimal data (only userId)
- User data fetched fresh on each request

---

## Common Issues and Solutions

### Issue 1: "Unauthorized - No token provided"
**Cause:** Cookie not being sent with request
**Solution:**
- Ensure cookie-parser middleware is installed
- Check that login was successful and set cookie
- In Postman, ensure cookies are enabled
- Check browser console for cookie in Application tab

### Issue 2: "Unauthorized - Token expired"
**Cause:** JWT token expired after 7 days
**Solution:**
- Login again to get new token
- Consider implementing refresh tokens for longer sessions

### Issue 3: Cookie not persisting
**Cause:** Cookie settings incompatible with environment
**Solution:**
- In development, ensure secure is false
- Check sameSite settings if using different domains
- Verify cookie-parser is before routes in middleware chain

### Issue 4: "User not found" after valid token
**Cause:** User deleted from database but token still valid
**Solution:**
- Token contains userId that no longer exists
- User needs to login again with valid credentials

### Issue 5: CORS issues with cookies
**Cause:** Frontend and backend on different origins
**Solution:**
```javascript
// In server.js
app.use(cors({
    origin: 'http://localhost:5173',  // Frontend URL
    credentials: true                  // Allow cookies
}));
```

---

## Flow Diagram

```
LOGIN FLOW:
1. User sends email + password → POST /api/auth/login
2. Controller validates input
3. Find user by email in database
4. Compare password with hash
5. Generate JWT token
6. Set httpOnly cookie with token
7. Return user data (no password)

PROTECTED ROUTE FLOW:
1. User requests protected resource
2. Middleware extracts JWT from cookie
3. Verify token signature and expiration
4. Extract userId from token
5. Fetch user from database
6. Attach user to req.user
7. Continue to route handler

LOGOUT FLOW:
1. User requests logout → POST /api/auth/logout
2. Controller clears JWT cookie (maxAge: 0)
3. Return success message
4. Client loses authentication
```

---

## Next Steps

After implementing login and logout:

1. **Implement Token Refresh:**
   - Add refresh token for long-term sessions
   - Rotate access tokens periodically

2. **Add Password Reset:**
   - Forgot password functionality
   - Email verification for reset

3. **Implement Rate Limiting:**
   - Prevent brute force attacks
   - Limit login attempts per IP

4. **Add Session Management:**
   - Track active sessions
   - Allow user to logout all devices

5. **Frontend Integration:**
   - Store authentication state
   - Implement axios interceptors
   - Handle token expiration gracefully
   - Redirect to login on 401 errors

---

## Summary

This implementation provides:
- ✅ Secure login with JWT authentication
- ✅ Password verification with bcrypt
- ✅ HttpOnly cookie storage for XSS protection
- ✅ Logout functionality with cookie clearing
- ✅ Protected route middleware
- ✅ Comprehensive error handling
- ✅ User data exclusion of sensitive fields
- ✅ Token expiration management
- ✅ Security best practices

The authentication system is now complete with signup, login, and logout functionality, ready for production use with proper security measures in place.
