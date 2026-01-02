# Frontend-Backend Connection Setup Guide

## Overview
This document explains how the frontend and backend of the Convo chat application communicate with each other, including authentication flow, API configuration, and data exchange.

---

## Architecture

```
┌─────────────────────┐         HTTP Requests        ┌─────────────────────┐
│                     │    ───────────────────────>   │                     │
│  Frontend (React)   │                               │  Backend (Express)  │
│  Port: 5173         │    <───────────────────────   │  Port: 6001         │
│                     │      JSON Responses + Cookies │                     │
└─────────────────────┘                               └─────────────────────┘
```

---

## Port Configuration

### Backend (`backend/.env`)
```env
PORT=6001
```
The backend Express server runs on port **6001**.

### Frontend (`frontend/src/lib/axios.js`)
```javascript
export const axiosInstance = axios.create({
    baseURL: "http://localhost:6001/api",  // Points to backend port
    withCredentials: true,
})
```
The frontend axios instance is configured to send all API requests to `http://localhost:6001/api`.

---

## CORS Configuration

### Backend CORS Setup (`backend/src/server.js`)
```javascript
app.use(cors({
    origin: "http://localhost:5173",  // Frontend URL
    credentials: true,                 // Allow cookies to be sent
}))
```

**Explanation:**
- `origin`: Specifies which frontend URL is allowed to make requests to the backend
- `credentials: true`: Allows the backend to accept cookies from the frontend (essential for JWT authentication)

---

## Axios Instance Configuration

### File: `frontend/src/lib/axios.js`

```javascript
import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: "http://localhost:6001/api",
    withCredentials: true,
})
```

**How it works:**
1. **baseURL**: All API calls using `axiosInstance` will automatically prepend this URL
   - Example: `axiosInstance.post('/auth/signup', data)` → `http://localhost:6001/api/auth/signup`

2. **withCredentials**: Tells axios to include cookies in every request
   - This is crucial for sending JWT tokens stored in cookies
   - Without this, authentication won't work

---

## Authentication Flow (Signup Example)

### Step-by-Step Process:

#### 1. User Submits Signup Form (`frontend/src/pages/SignupPage.jsx`)

```javascript
const handleSignup = async (e) => {
    e.preventDefault()
    
    // Validate terms agreement
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      // Send POST request to backend
      const response = await axiosInstance.post('/auth/signup', signupData);
      
      if (response.data.success) {
        toast.success('Account created successfully!');
        navigate('/onboarding');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
}
```

**What happens:**
- Prevents default form submission
- Validates that user agreed to terms
- Sets loading state (disables button, shows "Creating Account...")
- Sends signup data to `/api/auth/signup`
- On success: Shows success message and navigates to onboarding
- On error: Displays error message from backend

#### 2. Backend Receives Request (`backend/src/controllers/auth.controller.js`)

```javascript
export async function signup(req, res){
    const {email, password, fullName} = req.body

    try{
        // Validate all fields are present
        if(!email || !password || !fullName){
            return res.status(400).json({message: "All fields are required"});
        }

        // Validate password length
        if(password.length < 8){
            return res.status(400).json({message: "Password must be at least 8 characters long"})
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Invalid email format"});
        }

        // Check if email already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email is already registered"});
        }

        // Generate random avatar
        const idx = Math.floor(Math.random() * 100)+1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        // Create new user in database
        const newUser = await User.create({
            email,
            password,  // Password is hashed automatically by mongoose pre-save hook
            fullName,
            profilePic: randomAvatar,
        });

        // Create Stream Chat user
        try{
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
        }catch(error){
            console.log("Error creating Stream user:", error);
        }
        
        // Generate JWT token
        const token = jwt.sign(
            {UserId: newUser._id}, 
            process.env.JWT_SECRET_KEY, 
            {expiresIn: "7d"}
        )

        // Set JWT as HTTP-only cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 1000,  // 7 days in milliseconds
            httpOnly: true,              // Cannot be accessed by JavaScript
            sameSite: "strict",          // CSRF protection
            secure: process.env.NODE_ENV==="production"  // HTTPS only in production
        })

        // Send success response
        res.status(201).json({success:true, user:newUser})

    }catch(error){
        console.log("Error in the signup controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }
}
```

**Backend Process:**
1. **Validation**: Checks all required fields, password length, email format
2. **Duplicate Check**: Ensures email isn't already registered
3. **User Creation**: Saves user to MongoDB database
4. **Stream Chat Setup**: Creates user in Stream Chat service
5. **JWT Generation**: Creates authentication token
6. **Cookie Setting**: Stores JWT in HTTP-only cookie (secure)
7. **Response**: Sends success response with user data

#### 3. Frontend Receives Response

- Success (201): Shows success toast, redirects to `/onboarding`
- Error (4xx/5xx): Displays error message from backend

---

## Cookie-Based Authentication

### Why HTTP-Only Cookies?

```javascript
res.cookie("jwt", token, {
    httpOnly: true,    // JavaScript cannot access this cookie
    sameSite: "strict", // Prevents CSRF attacks
    secure: true,      // HTTPS only (in production)
})
```

**Benefits:**
- **Security**: JavaScript cannot read the cookie (prevents XSS attacks)
- **Automatic**: Browser automatically sends cookie with every request
- **CSRF Protection**: `sameSite: "strict"` prevents cross-site attacks

### How It Works:
1. Backend sets cookie in response
2. Browser stores cookie automatically
3. Browser sends cookie with every subsequent request to the same domain
4. Backend middleware validates cookie on protected routes

---

## API Routes Structure

### Backend Routes (`backend/src/server.js`)
```javascript
app.use("/api/auth", authRoutes);     // /api/auth/signup, /api/auth/login, etc.
app.use("/api/users", userRoutes);    // /api/users/profile, etc.
app.use("/api/chats", chatRoutes);    // /api/chats/messages, etc.
```

### Frontend API Calls
```javascript
// Signup
axiosInstance.post('/auth/signup', data)  
// → http://localhost:6001/api/auth/signup

// Login
axiosInstance.post('/auth/login', data)   
// → http://localhost:6001/api/auth/login

// Get user profile
axiosInstance.get('/users/profile')       
// → http://localhost:6001/api/users/profile
```

---

## Running the Application

### 1. Start Backend
```bash
cd backend
npm install          # Install dependencies (first time only)
npm run dev          # Start development server on port 6001
```

### 2. Start Frontend (New Terminal)
```bash
cd frontend
npm install          # Install dependencies (first time only)
npm run dev          # Start development server on port 5173
```

### 3. Access Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:6001/api`

---

## Environment Variables Required

### Backend (`.env`)
```env
PORT=6001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
NODE_ENV=development
```

---

## Error Handling

### Frontend Error Display
```javascript
catch (error) {
    const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
    toast.error(errorMessage);
}
```

**How it works:**
- Tries to get error message from backend response
- Falls back to generic message if none exists
- Displays error using `react-hot-toast` library

### Backend Error Responses
```javascript
// Validation error
res.status(400).json({message: "All fields are required"});

// Already exists
res.status(400).json({message: "Email is already registered"});

// Server error
res.status(500).json({message: "Internal Server Error"})
```

---

## State Management

### Loading State
```javascript
const [isLoading, setIsLoading] = useState(false);

// Before request
setIsLoading(true);

// After request (success or error)
setIsLoading(false);
```

**Purpose:** 
- Prevents multiple submissions
- Shows loading indicator to user
- Disables submit button during processing

---

## Key Takeaways

1. **Port Matching**: Frontend axios must point to correct backend port (6001)
2. **CORS Setup**: Backend must allow frontend origin with credentials
3. **withCredentials**: Required in axios for cookie-based auth
4. **HTTP-Only Cookies**: Secure way to store JWT tokens
5. **Error Handling**: Always handle errors gracefully with user feedback
6. **Loading States**: Improve UX by showing loading indicators
7. **Environment Variables**: Never commit sensitive data to git

---

## Troubleshooting

### Issue: "Network Error" or "CORS Error"
- **Check**: Backend is running on port 6001
- **Check**: CORS origin matches frontend URL
- **Check**: `withCredentials: true` in axios config

### Issue: "Authentication Failed"
- **Check**: Cookies are being set (check browser DevTools → Application → Cookies)
- **Check**: `withCredentials: true` in axios
- **Check**: JWT_SECRET_KEY is set in backend .env

### Issue: "Cannot POST /api/auth/signup"
- **Check**: Backend routes are properly configured
- **Check**: Express middleware order (CORS before routes)
- **Check**: baseURL in axios matches backend URL

---

## Security Best Practices

✅ **Implemented:**
- HTTP-only cookies for JWT storage
- CORS restrictions
- Password length validation
- Email format validation
- SameSite cookie attribute

⚠️ **Additional Recommendations:**
- Use HTTPS in production
- Implement rate limiting
- Add password strength requirements
- Enable CSRF tokens for extra security
- Implement password hashing (already done via mongoose pre-save)
