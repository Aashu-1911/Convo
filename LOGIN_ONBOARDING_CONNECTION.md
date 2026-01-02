# Login & Onboarding Frontend-Backend Connection Guide

## Overview
This document details how the Login and Onboarding pages connect with the backend authentication system, including data flow, API endpoints, authentication tokens, and user state management.

---

## Architecture Flow

```
┌──────────────┐      Login Request       ┌──────────────┐
│              │ ────────────────────────> │              │
│  Login Page  │                           │   Backend    │
│              │ <──────────────────────── │ /auth/login  │
│              │   JWT Cookie + User Data  │              │
└──────┬───────┘                           └──────────────┘
       │
       │ isOnboarded = false?
       ├─ Yes ──> Navigate to /onboarding
       └─ No  ──> Navigate to /home
       
┌──────────────┐   Onboarding Request     ┌──────────────┐
│              │ ────────────────────────> │              │
│  Onboarding  │                           │   Backend    │
│     Page     │ <──────────────────────── │ /auth/onboard│
│              │  Updated User + Success   │              │
└──────────────┘                           └──────────────┘
       │
       └─> Navigate to /home
```

---

## 1. Login Page Connection

### Frontend: `frontend/src/pages/LoginPage.jsx`

#### State Management
```javascript
const [loginData, setLoginData] = useState({
  email: "",
  password: ""
});
const [isLoading, setIsLoading] = useState(false);
```

#### Login Handler Function
```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  
  setIsLoading(true);
  try {
    const response = await axiosInstance.post('/auth/login', loginData);
    
    if (response.data.success) {
      toast.success('Login successful!');
      
      // Check if user needs to complete onboarding
      if (!response.data.user.isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
}
```

**How it works:**
1. User submits email and password
2. `POST` request sent to `/api/auth/login` (via axiosInstance baseURL)
3. Backend validates credentials and returns JWT cookie + user data
4. Frontend checks `isOnboarded` status:
   - `false` → Redirect to `/onboarding`
   - `true` → Redirect to home page `/`

### Backend: `backend/src/controllers/auth.controller.js`

#### Login Controller
```javascript
export async function login(req, res){
  try{
    const {email, password} = req.body;
    
    // Validate required fields
    if(!email || !password){
      return res.status(400).json({message: "All fields are required"});
    }

    // Find user by email
    const user = await User.findOne({email});
    if(!user){
      return res.status(401).json({message: "Invalid email or password"});
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if(!isPasswordValid){
      return res.status(401).json({message: "Invalid email or password"})
    }

    // Generate JWT token
    const token = jwt.sign({UserId: user._id}, process.env.JWT_SECRET_KEY,{
      expiresIn: "7d"
    });

    // Set JWT as HTTP-only cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 1000,  // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV==="production"
    })

    // Return success with user data
    res.status(200).json({success: true, user});
  }
  catch(error){
    console.log("Error in the Login controller", error);
    res.status(500).json({message: "Internal Server Error"});
  }
}
```

### Backend Route: `backend/src/routes/auth.route.js`
```javascript
router.post("/login", login)
```

**Complete API Endpoint:** `POST http://localhost:6001/api/auth/login`

---

## 2. Onboarding Page Connection

### Frontend: `frontend/src/pages/OnboardingPage.jsx`

#### State Management
```javascript
const [profileData, setProfileData] = useState({
  fullName: '',
  bio: '',
  nativeLanguage: '',
  learningLanguage: '',
  location: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beth'
});
const [isLoading, setIsLoading] = useState(false);
```

#### Onboarding Handler Function
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  setIsLoading(true);
  try {
    // Map frontend data to backend expected format
    const onboardingData = {
      fullName: profileData.fullName,
      bio: profileData.bio,
      nativeLanguage: profileData.nativeLanguage,
      learningLanguages: [profileData.learningLanguage], // Backend expects array
      location: profileData.location,
      profilePic: profileData.avatar
    };

    const response = await axiosInstance.post('/auth/onboarding', onboardingData);
    
    if (response.data.success) {
      toast.success('Profile completed successfully!');
      navigate('/');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to complete onboarding. Please try again.';
    toast.error(errorMessage);
    
    // Show specific missing fields if provided
    if (error.response?.data?.missingFields) {
      console.error('Missing fields:', error.response.data.missingFields);
    }
  } finally {
    setIsLoading(false);
  }
};
```

**Important Data Transformation:**
- Frontend uses singular `learningLanguage` (string)
- Backend expects `learningLanguages` (array)
- Frontend `avatar` → Backend `profilePic`

### Backend: `backend/src/controllers/auth.controller.js`

#### Onboarding Controller
```javascript
export async function onboard(req, res){
  try{
    const userId = req.user._id;  // From protectRoute middleware
    const {fullName, nativeLanguage, profilePic, bio, learningLanguages, location} = req.body;

    // Validate required fields
    if(!fullName || !nativeLanguage || !learningLanguages || learningLanguages.length===0){
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          (!learningLanguages || learningLanguages.length===0) && "learningLanguages",
          !location && "location",
        ].filter(Boolean),
      });
    }

    // Update user with onboarding data
    const updateUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true,
    }, {new: true});

    if(!updateUser){
      return res.status(404).json({message: "User not found"});
    }

    // Update Stream user for video chat
    try{
      await upsertStreamUser({
        id: updateUser._id.toString(),
        name: updateUser.fullName,
        image: updateUser.profilePic || "",
      })
      console.log(`Stream user updated after onboarding for ${updateUser.fullName}`);
    }
    catch(streamError){
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }
    
    res.status(200).json({success: true, user: updateUser});
  }
  catch(error){
    console.log("Error in onboarding",error);
    res.status(500).json({message: "Internal Server Error"});
  }
}
```

### Backend Route: `backend/src/routes/auth.route.js`
```javascript
router.post("/onboarding", protectRoute, onboard);
```

**Complete API Endpoint:** `POST http://localhost:6001/api/auth/onboarding`

**Important:** This route uses `protectRoute` middleware, which:
- Verifies JWT token from cookies
- Extracts user ID and attaches `req.user` to the request
- Returns 401 if token is invalid or missing

---

## Authentication Middleware

### File: `backend/src/middleware/auth.middleware.js`

The `protectRoute` middleware is crucial for the onboarding endpoint:

```javascript
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.UserId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

---

## Request/Response Examples

### Login API Call

#### Request
```javascript
POST http://localhost:6001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Successful Response
```javascript
Status: 200 OK
Set-Cookie: jwt=<token>; Max-Age=604800; HttpOnly; SameSite=Strict

{
  "success": true,
  "user": {
    "_id": "65f7a8b9c1234567890abcde",
    "email": "john@example.com",
    "fullName": "John Doe",
    "profilePic": "https://avatar.iran.liara.run/public/42.png",
    "isOnboarded": false,
    "friends": [],
    "createdAt": "2024-03-17T10:30:00.000Z",
    "updatedAt": "2024-03-17T10:30:00.000Z"
  }
}
```

#### Error Response (Invalid Credentials)
```javascript
Status: 401 Unauthorized

{
  "message": "Invalid email or password"
}
```

### Onboarding API Call

#### Request
```javascript
POST http://localhost:6001/api/auth/onboarding
Content-Type: application/json
Cookie: jwt=<token>

{
  "fullName": "John Doe",
  "bio": "Language enthusiast learning Spanish",
  "nativeLanguage": "English",
  "learningLanguages": ["Spanish"],
  "location": "New York, USA",
  "profilePic": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
}
```

#### Successful Response
```javascript
Status: 200 OK

{
  "success": true,
  "user": {
    "_id": "65f7a8b9c1234567890abcde",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "Language enthusiast learning Spanish",
    "nativeLanguage": "English",
    "learningLanguage": "Spanish",
    "location": "New York, USA",
    "profilePic": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    "isOnboarded": true,
    "friends": [],
    "createdAt": "2024-03-17T10:30:00.000Z",
    "updatedAt": "2024-03-17T10:35:00.000Z"
  }
}
```

#### Error Response (Missing Fields)
```javascript
Status: 400 Bad Request

{
  "message": "All fields are required",
  "missingFields": ["nativeLanguage", "learningLanguages"]
}
```

---

## User Model Schema

### File: `backend/src/models/User.model.js`

```javascript
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  bio: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  nativeLanguage: {
    type: String,
    default: "",
  },
  learningLanguage: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }]
}, {timestamps: true});
```

**Key Fields for Login & Onboarding:**
- `isOnboarded`: Boolean flag determining if user completed onboarding
- Initially `false` after signup
- Set to `true` after completing onboarding

---

## Cookie-Based Authentication

### JWT Token Flow

1. **Login:** Backend generates JWT and sends it as HTTP-only cookie
2. **Storage:** Browser automatically stores the cookie
3. **Subsequent Requests:** Cookie sent automatically with every request
4. **Onboarding:** Cookie validates user identity via `protectRoute` middleware

### Cookie Configuration
```javascript
res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 1000,  // 7 days in milliseconds
  httpOnly: true,               // Prevents JavaScript access (XSS protection)
  sameSite: "strict",           // CSRF protection
  secure: process.env.NODE_ENV === "production"  // HTTPS only in production
})
```

### Axios Configuration
```javascript
// frontend/src/lib/axios.js
export const axiosInstance = axios.create({
  baseURL: "http://localhost:6001/api",
  withCredentials: true  // CRITICAL: Sends cookies with requests
})
```

---

## Error Handling

### Frontend Error Handling Pattern

Both Login and Onboarding pages use consistent error handling:

```javascript
try {
  const response = await axiosInstance.post(endpoint, data);
  
  if (response.data.success) {
    toast.success('Success message');
    navigate('/next-page');
  }
} catch (error) {
  const errorMessage = error.response?.data?.message || 'Fallback error message';
  toast.error(errorMessage);
} finally {
  setIsLoading(false);
}
```

### Backend Error Responses

Common error status codes:
- **400:** Bad Request (missing/invalid fields)
- **401:** Unauthorized (invalid credentials, missing token)
- **404:** Not Found (user doesn't exist)
- **500:** Internal Server Error

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Journey                            │
└─────────────────────────────────────────────────────────────────┘

1. User visits /login
   │
   ├─> Enters email & password
   │
   ├─> Submits form
   │
   ├─> POST /api/auth/login
   │
   ├─> Backend validates credentials
   │
   ├─> Backend returns JWT cookie + user data
   │
   ├─> Frontend checks user.isOnboarded
   │
   ├─> if false:
   │   │
   │   ├─> Navigate to /onboarding
   │   │
   │   ├─> User fills profile form
   │   │
   │   ├─> Submits onboarding data
   │   │
   │   ├─> POST /api/auth/onboarding (with JWT cookie)
   │   │
   │   ├─> Backend updates user.isOnboarded = true
   │   │
   │   └─> Navigate to /home
   │
   └─> if true:
       │
       └─> Navigate to /home directly
```

---

## Testing the Connection

### Test Login Flow

1. Start backend server: `cd backend && npm run dev`
2. Start frontend server: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Enter credentials of an existing user
5. Verify:
   - Success toast appears
   - JWT cookie is set (check DevTools → Application → Cookies)
   - Redirects to `/onboarding` (if not onboarded) or `/` (if onboarded)

### Test Onboarding Flow

1. Login with a new account that hasn't completed onboarding
2. Should automatically redirect to `/onboarding`
3. Fill out the onboarding form:
   - Full Name
   - Bio
   - Native Language
   - Learning Language
   - Location
   - Avatar (optional)
4. Submit form
5. Verify:
   - Success toast appears
   - User redirects to home page
   - User data is updated in database

---

## Common Issues & Solutions

### Issue 1: Cookie Not Being Sent
**Symptom:** 401 Unauthorized on onboarding request

**Solution:** Ensure `withCredentials: true` in axios configuration:
```javascript
// frontend/src/lib/axios.js
export const axiosInstance = axios.create({
  baseURL: "http://localhost:6001/api",
  withCredentials: true  // Must be true!
})
```

### Issue 2: CORS Error
**Symptom:** Network error, CORS policy blocks request

**Solution:** Verify backend CORS configuration:
```javascript
// backend/src/server.js
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
```

### Issue 3: Onboarding Fails with "All fields required"
**Symptom:** 400 error with missing fields message

**Solution:** Ensure frontend sends data in correct format:
- `learningLanguages` must be an **array**, not a string
- All required fields must be present

### Issue 4: User Not Redirecting After Login
**Symptom:** Login succeeds but stays on login page

**Solution:** Check navigation logic in login handler:
```javascript
if (!response.data.user.isOnboarded) {
  navigate('/onboarding');
} else {
  navigate('/');
}
```

---

## Security Considerations

1. **Password Hashing:** Passwords are hashed using bcrypt before storage
2. **HTTP-Only Cookies:** JWT token not accessible via JavaScript (XSS protection)
3. **SameSite Strict:** Prevents CSRF attacks
4. **HTTPS in Production:** Secure flag ensures cookie only sent over HTTPS
5. **Token Expiration:** JWT expires after 7 days
6. **Password Validation:** Minimum 8 characters enforced

---

## Next Steps

After successful login and onboarding:
1. User can access protected routes (friends, chat, etc.)
2. JWT cookie authenticates all subsequent requests
3. User data available via `/api/auth/me` endpoint
4. Stream Chat user created for video call functionality

---

## Related Files

### Frontend
- `frontend/src/pages/LoginPage.jsx` - Login page component
- `frontend/src/pages/OnboardingPage.jsx` - Onboarding page component
- `frontend/src/lib/axios.js` - Axios configuration with credentials

### Backend
- `backend/src/controllers/auth.controller.js` - Authentication controllers
- `backend/src/routes/auth.route.js` - Authentication routes
- `backend/src/middleware/auth.middleware.js` - JWT verification middleware
- `backend/src/models/User.model.js` - User database schema

---

## Summary

The Login and Onboarding connection uses a **cookie-based JWT authentication** system where:

1. **Login** validates credentials and issues a JWT cookie
2. **Frontend** checks `isOnboarded` status to determine next step
3. **Onboarding** uses the JWT cookie to authenticate and update user profile
4. **Middleware** protects the onboarding route by verifying JWT
5. **Success** redirects user to home page with full access to the application

This provides a secure, seamless authentication and onboarding experience for new users.
