# Complete Frontend-Backend Connection Guide

## Overview
This document provides a comprehensive guide to all frontend-backend connections in the Convo chat application. Each page's integration with backend APIs is detailed with request/response examples, data flow, and implementation patterns.

---

## Table of Contents
1. [SignupPage](#1-signuppage)
2. [LoginPage](#2-loginpage)
3. [OnboardingPage](#3-onboardingpage)
4. [HomePage](#4-homepage)
5. [NotificationsPage](#5-notificationspage)
6. [ChatPage](#6-chatpage)
7. [CallPage](#7-callpage)
8. [Common Patterns](#common-patterns)
9. [API Endpoints Summary](#api-endpoints-summary)

---

## 1. SignupPage

### Purpose
User registration and account creation.

### Frontend: `frontend/src/pages/SignupPage.jsx`

#### API Integration
```javascript
const handleSignup = async (e) => {
  e.preventDefault()
  
  if (!agreedToTerms) {
    toast.error('Please agree to the terms and conditions');
    return;
  }

  setIsLoading(true);
  try {
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

### Backend Endpoint
- **URL:** `POST /api/auth/signup`
- **Controller:** `auth.controller.js` → `signup`
- **Authentication:** None required

### Request Body
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response
```json
{
  "success": true,
  "user": {
    "_id": "65f7a8b9c1234567890abcde",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://avatar.iran.liara.run/public/42.png",
    "isOnboarded": false,
    "friends": []
  }
}
```

### Flow
1. User fills signup form
2. Validates terms agreement
3. Sends POST request to `/api/auth/signup`
4. Backend creates user and sets JWT cookie
5. Redirects to `/onboarding`

---

## 2. LoginPage

### Purpose
User authentication and session creation.

### Frontend: `frontend/src/pages/LoginPage.jsx`

#### API Integration
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

### Backend Endpoint
- **URL:** `POST /api/auth/login`
- **Controller:** `auth.controller.js` → `login`
- **Authentication:** None required

### Request Body
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response
```json
{
  "success": true,
  "user": {
    "_id": "65f7a8b9c1234567890abcde",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isOnboarded": true,
    "profilePic": "...",
    "friends": []
  }
}
```

### Flow
1. User enters credentials
2. Sends POST request to `/api/auth/login`
3. Backend validates credentials and sets JWT cookie
4. Frontend checks `isOnboarded` status
5. Redirects to `/onboarding` or `/` (home)

---

## 3. OnboardingPage

### Purpose
Complete user profile after signup.

### Frontend: `frontend/src/pages/OnboardingPage.jsx`

#### API Integration
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
    const errorMessage = error.response?.data?.message || 'Failed to complete onboarding.';
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};
```

### Backend Endpoint
- **URL:** `POST /api/auth/onboarding`
- **Controller:** `auth.controller.js` → `onboard`
- **Authentication:** Required (protectRoute middleware)

### Request Body
```json
{
  "fullName": "John Doe",
  "bio": "Language enthusiast learning Spanish",
  "nativeLanguage": "English",
  "learningLanguages": ["Spanish"],
  "location": "New York, USA",
  "profilePic": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
}
```

### Response
```json
{
  "success": true,
  "user": {
    "_id": "65f7a8b9c1234567890abcde",
    "fullName": "John Doe",
    "email": "john@example.com",
    "bio": "Language enthusiast learning Spanish",
    "nativeLanguage": "English",
    "learningLanguage": "Spanish",
    "location": "New York, USA",
    "profilePic": "...",
    "isOnboarded": true
  }
}
```

### Flow
1. User fills profile form
2. Sends POST request with JWT cookie
3. Backend updates user and sets `isOnboarded = true`
4. Redirects to `/` (home)

---

## 4. HomePage

### Purpose
Display user's friends and recommended language learning partners.

### Frontend: `frontend/src/pages/HomePage.jsx`

#### API Integration
```javascript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const [userResponse, friendsResponse, recommendedResponse] = await Promise.all([
      axiosInstance.get('/auth/me'),
      axiosInstance.get('/users/friends'),
      axiosInstance.get('/users')
    ]);

    setCurrentUser(userResponse.data.user);
    setFriends(friendsResponse.data.friends);
    setRecommendedUsers(recommendedResponse.data.recommendedUsers);
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response?.status === 401) {
      navigate('/login');
    } else {
      toast.error('Failed to load data');
    }
  } finally {
    setIsLoading(false);
  }
};

const handleSendFriendRequest = async (userId) => {
  try {
    setSendingRequestTo(userId);
    await axiosInstance.post(`/users/friend-requests/${userId}`);
    toast.success('Friend request sent successfully!');
    // Remove user from recommended list
    setRecommendedUsers(recommendedUsers.filter(user => user._id !== userId));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send friend request';
    toast.error(errorMessage);
  } finally {
    setSendingRequestTo(null);
  }
};
```

### Backend Endpoints

#### Get Current User
- **URL:** `GET /api/auth/me`
- **Controller:** `auth.route.js` (inline handler)
- **Authentication:** Required

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": "...",
    "isOnboarded": true
  }
}
```

#### Get Friends
- **URL:** `GET /api/users/friends`
- **Controller:** `user.controller.js` → `getMyFriends`
- **Authentication:** Required

**Response:**
```json
{
  "friends": [
    {
      "_id": "...",
      "fullName": "Beth Doe",
      "profilePic": "...",
      "nativeLanguage": "English",
      "learningLanguages": ["Spanish"]
    }
  ]
}
```

#### Get Recommended Users
- **URL:** `GET /api/users`
- **Controller:** `user.controller.js` → `getRecommendedUsers`
- **Authentication:** Required

**Response:**
```json
{
  "recommendedUsers": [
    {
      "_id": "...",
      "fullName": "Sofia Garcia",
      "profilePic": "...",
      "nativeLanguage": "Spanish",
      "learningLanguage": "German",
      "bio": "Language teacher...",
      "location": "Madrid"
    }
  ]
}
```

#### Send Friend Request
- **URL:** `POST /api/users/friend-requests/:id`
- **Controller:** `user.controller.js` → `sendFriendRequest`
- **Authentication:** Required

**Response:**
```json
{
  "message": "Friend request sent successfully."
}
```

### Flow
1. Page loads → Fetches user data, friends, and recommendations in parallel
2. Displays friends in "Your Friends" section
3. Displays recommended users in "Meet New Learners" section
4. User clicks "Send Friend Request" → Sends POST request
5. Updates UI to remove user from recommendations

---

## 5. NotificationsPage

### Purpose
Display incoming friend requests and accepted connections.

### Frontend: `frontend/src/pages/NotificationsPage.jsx`

#### API Integration
```javascript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const [userResponse, requestsResponse] = await Promise.all([
      axiosInstance.get('/auth/me'),
      axiosInstance.get('/users/friend-requests')
    ]);

    setCurrentUser(userResponse.data.user);
    setFriendRequests(requestsResponse.data.incomingRequests);
    setAcceptedRequests(requestsResponse.data.acceptedRequests);
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response?.status === 401) {
      navigate('/login');
    } else {
      toast.error('Failed to load notifications');
    }
  } finally {
    setIsLoading(false);
  }
};

const handleAcceptRequest = async (requestId) => {
  try {
    setAcceptingRequest(requestId);
    await axiosInstance.put(`/users/friend-requests/${requestId}/accept`);
    toast.success('Friend request accepted!');
    // Refresh data to update the lists
    fetchData();
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to accept friend request';
    toast.error(errorMessage);
  } finally {
    setAcceptingRequest(null);
  }
};
```

### Backend Endpoints

#### Get Friend Requests
- **URL:** `GET /api/users/friend-requests`
- **Controller:** `user.controller.js` → `getFriendRequests`
- **Authentication:** Required

**Response:**
```json
{
  "incomingRequests": [
    {
      "_id": "request_id",
      "sender": {
        "_id": "user_id",
        "fullName": "Burak Örkmez",
        "profilePic": "...",
        "nativeLanguage": "Turkish",
        "learningLanguages": ["English"]
      },
      "status": "pending"
    }
  ],
  "acceptedRequests": [
    {
      "_id": "request_id",
      "recipient": {
        "_id": "user_id",
        "fullName": "Kyle Doe",
        "profilePic": "..."
      },
      "status": "accepted"
    }
  ]
}
```

#### Accept Friend Request
- **URL:** `PUT /api/users/friend-requests/:id/accept`
- **Controller:** `user.controller.js` → `acceptFriendRequest`
- **Authentication:** Required

**Response:**
```json
{
  "message": "Friend request accepted"
}
```

### Flow
1. Page loads → Fetches incoming and accepted requests
2. Displays pending requests in "Friend Requests" section
3. Displays accepted requests in "New Connections" section
4. User clicks "Accept" → Sends PUT request
5. Backend updates both users' friend lists
6. Refreshes data to show updated state

---

## 6. ChatPage

### Purpose
Real-time chat interface using Stream Chat SDK.

### Frontend: `frontend/src/pages/ChatPage.jsx`

#### API Integration
```javascript
useEffect(() => {
  fetchStreamToken();
}, []);

const fetchStreamToken = async () => {
  try {
    const response = await axiosInstance.get('/chat/token');
    setStreamToken(response.data.token);
    // TODO: Initialize Stream Chat SDK with this token
    console.log('Stream token:', response.data.token);
  } catch (error) {
    console.error('Error fetching stream token:', error);
    toast.error('Failed to initialize chat');
  }
};
```

### Backend Endpoint
- **URL:** `GET /api/chat/token`
- **Controller:** `chat.controller.js` → `getStreamToken`
- **Authentication:** Required

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Stream Token Usage
The token is used to authenticate with Stream Chat SDK:
```javascript
// Example Stream Chat initialization (to be implemented)
import { StreamChat } from 'stream-chat';

const client = StreamChat.getInstance('YOUR_API_KEY');
await client.connectUser(
  {
    id: userId,
    name: userName,
    image: userProfilePic
  },
  streamToken  // Token from backend
);
```

### Flow
1. Page loads → Fetches Stream token from backend
2. Token is generated using Stream SDK on backend
3. Frontend uses token to connect to Stream Chat
4. Real-time messaging capabilities enabled

---

## 7. CallPage

### Purpose
Video call interface using Stream Video SDK.

### Frontend: `frontend/src/pages/CallPage.jsx`

#### API Integration
```javascript
useEffect(() => {
  fetchStreamToken();
}, []);

const fetchStreamToken = async () => {
  try {
    const response = await axiosInstance.get('/chat/token');
    setStreamToken(response.data.token);
    // TODO: Initialize Stream Video SDK with this token
    console.log('Stream token:', response.data.token);
  } catch (error) {
    console.error('Error fetching stream token:', error);
    toast.error('Failed to initialize video call');
  }
};
```

### Backend Endpoint
- **URL:** `GET /api/chat/token`
- **Controller:** `chat.controller.js` → `getStreamToken`
- **Authentication:** Required

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Stream Token Usage
Same token used for both chat and video:
```javascript
// Example Stream Video initialization (to be implemented)
import { StreamVideoClient } from '@stream-io/video-react-sdk';

const client = new StreamVideoClient({ apiKey: 'YOUR_API_KEY' });
await client.connectUser(
  {
    id: userId,
    name: userName,
    image: userProfilePic
  },
  streamToken  // Token from backend
);
```

### Flow
1. Page loads → Fetches Stream token from backend
2. Token is generated using Stream SDK on backend
3. Frontend uses token to connect to Stream Video
4. Real-time video call capabilities enabled

---

## Common Patterns

### 1. Authentication Pattern
All protected pages follow this pattern:

```javascript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setIsLoading(true);
    const response = await axiosInstance.get('/auth/me');
    setCurrentUser(response.data.user);
  } catch (error) {
    if (error.response?.status === 401) {
      navigate('/login');  // Redirect if not authenticated
    }
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Error Handling Pattern
Consistent error handling across all pages:

```javascript
try {
  const response = await axiosInstance.post(endpoint, data);
  toast.success('Success message');
} catch (error) {
  const errorMessage = error.response?.data?.message || 'Fallback error message';
  toast.error(errorMessage);
} finally {
  setIsLoading(false);
}
```

### 3. Loading State Pattern
All async operations show loading state:

```javascript
const [isLoading, setIsLoading] = useState(false);

<button 
  disabled={isLoading}
  className='... disabled:bg-gray-700 disabled:cursor-not-allowed'
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### 4. Logout Pattern
Consistent logout across all pages:

```javascript
const handleLogout = async () => {
  try {
    await axiosInstance.post('/auth/logout');
    toast.success('Logged out successfully');
    navigate('/login');
  } catch (error) {
    toast.error('Logout failed');
  }
};
```

---

## API Endpoints Summary

### Authentication Endpoints
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/signup` | Create new account | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| POST | `/api/auth/onboarding` | Complete profile | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### User Endpoints
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/users` | Get recommended users | Yes |
| GET | `/api/users/friends` | Get user's friends | Yes |
| POST | `/api/users/friend-requests/:id` | Send friend request | Yes |
| PUT | `/api/users/friend-requests/:id/accept` | Accept friend request | Yes |
| GET | `/api/users/friend-requests` | Get incoming/accepted requests | Yes |
| GET | `/api/users/outgoing-friend-requests` | Get outgoing requests | Yes |

### Chat Endpoints
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/chat/token` | Get Stream token | Yes |

---

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Flow                         │
└─────────────────────────────────────────────────────────────────┘

1. User visits /signup
   ├─> POST /api/auth/signup
   ├─> JWT cookie set
   └─> Navigate to /onboarding

2. User completes onboarding
   ├─> POST /api/auth/onboarding (with JWT)
   ├─> User.isOnboarded = true
   └─> Navigate to / (home)

3. HomePage loads
   ├─> GET /api/auth/me (verify session)
   ├─> GET /api/users/friends
   ├─> GET /api/users (recommended)
   └─> Display data

4. User sends friend request
   ├─> POST /api/users/friend-requests/:id
   └─> Update UI

5. Recipient views notifications
   ├─> GET /api/users/friend-requests
   └─> Display incoming requests

6. Recipient accepts request
   ├─> PUT /api/users/friend-requests/:id/accept
   ├─> Both users' friend lists updated
   └─> Refresh data

7. Users access chat/video
   ├─> GET /api/chat/token
   ├─> Initialize Stream SDK
   └─> Enable real-time features
```

---

## Cookie-Based Authentication

All authenticated requests use HTTP-only cookies:

### Cookie Configuration (Backend)
```javascript
res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  httpOnly: true,                    // Prevents JS access
  sameSite: "strict",                // CSRF protection
  secure: process.env.NODE_ENV === "production"  // HTTPS only in prod
});
```

### Axios Configuration (Frontend)
```javascript
export const axiosInstance = axios.create({
  baseURL: "http://localhost:6001/api",
  withCredentials: true  // CRITICAL: Sends cookies automatically
});
```

### Middleware Protection
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

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String (hashed),
  bio: String,
  profilePic: String,
  nativeLanguage: String,
  learningLanguage: String,
  location: String,
  isOnboarded: Boolean,
  friends: [ObjectId],  // References to other users
  createdAt: Date,
  updatedAt: Date
}
```

### FriendRequest Model
```javascript
{
  _id: ObjectId,
  sender: ObjectId,      // Reference to User
  recipient: ObjectId,   // Reference to User
  status: String,        // "pending" | "accepted" | "rejected"
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing Guide

### 1. Test Signup Flow
```bash
# Start servers
cd backend && npm run dev
cd frontend && npm run dev

# Navigate to http://localhost:5173/signup
# Fill form and submit
# Verify redirect to /onboarding
```

### 2. Test Login Flow
```bash
# Navigate to http://localhost:5173/login
# Enter credentials
# Verify redirect based on isOnboarded status
```

### 3. Test HomePage
```bash
# Login first
# Navigate to http://localhost:5173/
# Verify friends list loads
# Verify recommended users load
# Click "Send Friend Request"
# Verify user removed from recommendations
```

### 4. Test Notifications
```bash
# Login as User A
# Send friend request to User B
# Login as User B
# Navigate to /notifications
# Verify request appears
# Click "Accept"
# Verify both users' friend lists updated
```

---

## Environment Variables

### Backend `.env`
```env
PORT=6001
MONGODB_URI=mongodb://localhost:27017/convo
JWT_SECRET_KEY=your_secret_key_here
NODE_ENV=development

# Stream API credentials
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### Frontend
No environment variables needed (uses hardcoded localhost URLs for development).

---

## Security Considerations

1. **Password Hashing:** Bcrypt with salt rounds = 10
2. **JWT Expiration:** 7 days
3. **HTTP-Only Cookies:** Prevents XSS attacks
4. **SameSite Strict:** Prevents CSRF attacks
5. **HTTPS in Production:** Secure cookie flag enabled
6. **Input Validation:** Email format, password length
7. **Protected Routes:** Middleware validates JWT on all authenticated endpoints

---

## Common Issues & Solutions

### Issue 1: 401 Unauthorized on protected routes
**Cause:** Cookie not being sent with requests

**Solution:**
```javascript
// Ensure withCredentials is true
export const axiosInstance = axios.create({
  baseURL: "http://localhost:6001/api",
  withCredentials: true  // Must be true!
});
```

### Issue 2: CORS error
**Cause:** Backend not configured to accept frontend origin

**Solution:**
```javascript
// backend/src/server.js
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
```

### Issue 3: Data not loading on page
**Cause:** Not handling 401 redirects properly

**Solution:**
```javascript
catch (error) {
  if (error.response?.status === 401) {
    navigate('/login');  // Redirect to login
  } else {
    toast.error('Failed to load data');
  }
}
```

### Issue 4: Friend request fails with "already exists"
**Cause:** Request already sent or users are already friends

**Solution:** Backend validates and returns appropriate error message. Frontend displays it via toast.

---

## Next Steps

1. **Implement Stream Chat SDK** in ChatPage
2. **Implement Stream Video SDK** in CallPage
3. **Add real-time notifications** using WebSockets or polling
4. **Add message deletion/editing** functionality
5. **Add user profile editing** page
6. **Add friend removal** feature
7. **Add blocking/reporting** features
8. **Add file/image upload** to messages

---

## File Structure Summary

```
frontend/src/pages/
├── SignupPage.jsx       ✅ Connected to /api/auth/signup
├── LoginPage.jsx        ✅ Connected to /api/auth/login
├── OnboardingPage.jsx   ✅ Connected to /api/auth/onboarding
├── HomePage.jsx         ✅ Connected to /api/users/* endpoints
├── NotificationsPage.jsx ✅ Connected to /api/users/friend-requests
├── ChatPage.jsx         ✅ Connected to /api/chat/token
└── CallPage.jsx         ✅ Connected to /api/chat/token

backend/src/
├── controllers/
│   ├── auth.controller.js    ✅ signup, login, logout, onboard
│   ├── user.controller.js    ✅ friends, recommendations, requests
│   └── chat.controller.js    ✅ Stream token generation
├── routes/
│   ├── auth.route.js         ✅ /api/auth/*
│   ├── user.route.js         ✅ /api/users/*
│   └── chat.route.js         ✅ /api/chat/*
├── middleware/
│   └── auth.middleware.js    ✅ JWT verification
└── models/
    ├── User.model.js         ✅ User schema
    └── FriendRequest.model.js ✅ Friend request schema
```

---

## Summary

All pages are now connected to their respective backend APIs:

✅ **SignupPage** - User registration with auto-login  
✅ **LoginPage** - Authentication with onboarding check  
✅ **OnboardingPage** - Profile completion  
✅ **HomePage** - Friends list, recommendations, friend requests  
✅ **NotificationsPage** - Incoming/accepted friend requests  
✅ **ChatPage** - Stream token for chat SDK  
✅ **CallPage** - Stream token for video SDK  

The application uses **cookie-based JWT authentication** with consistent error handling, loading states, and user feedback via toast notifications. All protected routes verify authentication and redirect to login when needed.
