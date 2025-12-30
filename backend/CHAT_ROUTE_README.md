# Chat Route Implementation - Stream Chat Integration

## Overview
This document explains the complete implementation of the **Chat Route** functionality using **Stream Chat SDK** for real-time messaging. The implementation provides token generation for authenticating users with the Stream Chat service, enabling them to participate in real-time conversations.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Stream Chat Integration](#stream-chat-integration)
3. [API Endpoints](#api-endpoints)
4. [Implementation Details](#implementation-details)
5. [Database Utilities](#database-utilities)
6. [Testing Guide](#testing-guide)
7. [Environment Configuration](#environment-configuration)

---

## Architecture Overview

### Technology Stack
- **Backend Framework**: Express.js
- **Real-time Chat Service**: Stream Chat SDK (v9.27.2)
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB (for user data)
- **Stream Service**: Stream Chat API (for messaging)

### How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Client    │────────▶│   Backend    │────────▶│   Stream Chat   │
│  (Frontend) │         │  (Express.js)│         │     Service     │
└─────────────┘         └──────────────┘         └─────────────────┘
      │                        │                          │
      │  1. Request Token      │                          │
      │───────────────────────▶│                          │
      │                        │  2. Generate Token       │
      │                        │─────────────────────────▶│
      │                        │                          │
      │                        │  3. Stream Token         │
      │                        │◀─────────────────────────│
      │  4. Return Token       │                          │
      │◀───────────────────────│                          │
      │                        │                          │
      │  5. Connect to Stream with Token                  │
      │──────────────────────────────────────────────────▶│
      │                        │                          │
      │  6. Real-time Messaging                           │
      │◀─────────────────────────────────────────────────▶│
```

---

## Stream Chat Integration

### What is Stream Chat?
Stream Chat is a hosted chat service that provides:
- Real-time messaging
- Message history and persistence
- Typing indicators
- Read receipts
- File uploads
- Rich media support
- Channel management
- Push notifications

### Why Use Stream Chat?
Instead of building a chat infrastructure from scratch, Stream Chat provides:
- ✅ Scalable real-time messaging
- ✅ Built-in features (reactions, threads, moderation)
- ✅ WebSocket management
- ✅ Message delivery guarantees
- ✅ Cross-platform SDKs

---

## API Endpoints

### Base URL
All chat-related endpoints are prefixed with: `/api/chats`

### Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chats/token` | Get Stream Chat authentication token | ✅ |

---

## Implementation Details

### 1. Stream Chat Route
**File:** `backend/src/routes/chat.route.js`

```javascript
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken)

export default router;
```

**Features:**
- Single endpoint for token generation
- Protected by JWT authentication middleware
- Returns Stream Chat token for authenticated users

---

### 2. Chat Controller
**File:** `backend/src/controllers/chat.controller.js`

```javascript
import { generateStreamToken } from "../db/stream.js";

export async function getStreamToken(req, res) {
    try {
        const token = generateStreamToken(req.user.id);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error generating stream token:", error);
        res.status(500).json({message: "Internal server error"});
    }
}
```

**How it works:**
1. Receives authenticated request (user attached by `protectRoute` middleware)
2. Generates Stream Chat token using user ID
3. Returns token to client
4. Client uses token to connect to Stream Chat service

**Response Format:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Stream Service Configuration
**File:** `backend/src/db/stream.js`

This module handles all Stream Chat SDK interactions.

#### Initialize Stream Client

```javascript
import {StreamChat} from "stream-chat";
import dotenv from "dotenv";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key and secret are required");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);
```

**Configuration:**
- Creates singleton Stream Chat client instance
- Uses environment variables for API credentials
- Validates API key and secret presence

#### User Upsert Function

```javascript
export const upsertStreamUser = async (userData) =>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch(error){
        console.error("Error upserting Stream user:", error);
    }
};
```

**Purpose:** Create or update users in Stream Chat

**When Called:**
1. **During Signup** - Creates Stream user when new user registers
2. **During Onboarding** - Updates Stream user with complete profile

**User Data Format:**
```javascript
{
    id: "user_mongodb_id",
    name: "User Full Name",
    image: "profile_picture_url"
}
```

#### Token Generation Function

```javascript
export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating stream token:", error);
    }
}
```

**Purpose:** Generate JWT token for Stream Chat authentication

**How it works:**
- Converts MongoDB ObjectId to string
- Uses Stream SDK to create signed token
- Token contains user ID and signature
- Token expires based on Stream's default settings

---

### 4. User Creation in Stream (Signup)
**File:** `backend/src/controllers/auth.controller.js`

When a user signs up, they are automatically created in Stream Chat:

```javascript
// Create user in MongoDB
const newUser = await User.create({
    email,
    password,
    fullName,
    profilePic: randomAvatar,
});

// Create corresponding user in Stream Chat
try{
    await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
    });
    console.log(`Stream user created for ${newUser.fullName}`)
}catch(error){
    console.log("Error creating Stream user:", error);
}
```

**Process:**
1. User registers with email, password, and name
2. User saved to MongoDB
3. Stream Chat user created with same ID
4. Both accounts now synchronized

---

### 5. User Update in Stream (Onboarding)
**File:** `backend/src/controllers/auth.controller.js`

When a user completes onboarding, their Stream profile is updated:

```javascript
// Update user in MongoDB with onboarding data
const updateUser = await User.findByIdAndUpdate(req.user.id, {
    ...req.body,
    isOnboarded: true,
}, {new: true});

// Update Stream Chat user profile
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
```

**Updated Fields:**
- Name (if changed)
- Profile picture
- Other profile information

---

## Database Utilities

### Delete Stream Users Utility
**File:** `backend/src/db/deleteStreamUsers.js`

A standalone utility script for cleaning up Stream Chat users.

```javascript
export async function deleteStreamUsers(userIds, hardDelete = true) {
    try {
        await streamClient.deleteUsers(userIds, { hard_delete: hardDelete });
        console.log(`✅ Users deleted successfully: ${userIds.join(", ")}`);
        return { success: true, deletedUsers: userIds };
    } catch (error) {
        console.error("❌ Error deleting users:", error.message);
        throw error;
    }
}
```

#### Usage from Command Line

```bash
# Delete single user
node src/db/deleteStreamUsers.js 6950844d3994ac8a5b117496

# Delete multiple users
node src/db/deleteStreamUsers.js userId1 userId2 userId3
```

#### Delete Types
- **Hard Delete** (default): Permanently removes user and all messages
- **Soft Delete**: Marks user as deleted but preserves data

**When to use:**
- Testing during development
- Removing test users
- User account deletion
- Data cleanup

---

## Environment Configuration

### Required Environment Variables

**File:** `.env` (in backend root)

```env
# Stream Chat Configuration
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key

# Server Configuration
PORT=5000
```

### Getting Stream Credentials

1. **Sign up** at [getstream.io](https://getstream.io/)
2. **Create a new app** in the dashboard
3. **Copy API Key** and **API Secret** from app settings
4. **Add to `.env`** file

---

## Testing Guide

### Prerequisites
- Server running on configured port
- User authenticated with valid JWT token
- Stream API credentials configured

### Test Case 1: Get Stream Token (Success)

**Request:**
```http
GET /api/chats/token
Headers:
  Cookie: jwt={valid_jwt_token}
```

**Expected Response (200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjk1MDg0NGQzOTk0YWM4YTViMTE3NDk2In0.Xn8kH9vW8YqT3pQs5mL2wE7xR6jK4dN9cF1aG8bV2hM"
}
```

**Token Structure:**
- Algorithm: HS256 (HMAC with SHA-256)
- Payload contains user ID
- Signature verifies authenticity

### Test Case 2: Get Stream Token (Unauthorized)

**Request:**
```http
GET /api/chats/token
Headers:
  (No cookie)
```

**Expected Response (401):**
```json
{
    "message": "Unauthorized: No token provided"
}
```

### Test Case 3: Verify User in Stream Dashboard

1. Navigate to Stream Dashboard
2. Go to "Chat" → "Users"
3. Search for user ID
4. Verify user details:
   - ID matches MongoDB user ID
   - Name matches user's full name
   - Image URL is populated

### Test Case 4: Connect Client to Stream

**Frontend Example (JavaScript):**
```javascript
// Get token from backend
const response = await fetch('/api/chats/token', {
    credentials: 'include' // Include cookies
});
const { token } = await response.json();

// Initialize Stream Chat client
import { StreamChat } from 'stream-chat';
const chatClient = StreamChat.getInstance('YOUR_API_KEY');

// Connect user to Stream
await chatClient.connectUser(
    {
        id: userId,
        name: userName,
        image: userImage
    },
    token
);

console.log('Connected to Stream Chat!');
```

---

## Server Integration

### Route Registration
**File:** `backend/src/server.js`

```javascript
import express from "express"
import "dotenv/config";
import cookieparser from "cookie-parser";

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';

const app = express();

app.use(express.json());
app.use(cookieparser());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes); // Chat route registered

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})
```

**Middleware Order:**
1. `express.json()` - Parse JSON request bodies
2. `cookieparser()` - Parse JWT from cookies
3. Route handlers with authentication

---

## Security Considerations

### 1. Token Security
- **Server-side generation**: Tokens never exposed in client code
- **Signed tokens**: Stream verifies token signature
- **User-specific**: Each token tied to specific user ID
- **JWT in HTTP-only cookies**: Prevents XSS attacks

### 2. Authentication Flow
```
User Login → JWT Cookie Set → Request Stream Token → Stream Token Generated → Client Connects to Stream
```

### 3. Authorization
- Only authenticated users can request tokens
- Token contains user ID from authenticated session
- Stream validates token on connection

### 4. Error Handling
- API credentials validated at startup
- Try-catch blocks for all async operations
- Error logging for debugging
- Generic error messages to client (prevents info leakage)

---

## Common Issues & Troubleshooting

### Issue 1: "Stream API key and secret are required"
**Cause:** Missing environment variables

**Solution:**
```bash
# Check .env file contains:
STREAM_API_KEY=your_key
STREAM_API_SECRET=your_secret
```

### Issue 2: Token Generation Fails
**Cause:** Invalid API credentials

**Solution:**
- Verify credentials in Stream Dashboard
- Ensure no extra spaces in .env file
- Restart server after changing .env

### Issue 3: User Not Created in Stream
**Cause:** API call failed during signup/onboarding

**Solution:**
- Check console logs for errors
- Verify network connectivity to Stream API
- Check Stream dashboard for rate limits

### Issue 4: Client Connection Fails
**Cause:** Invalid or expired token

**Solution:**
- Request new token from `/api/chats/token`
- Verify user is authenticated
- Check Stream API key in frontend matches backend

---

## Data Flow Diagram

### Complete User Journey

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER REGISTRATION                          │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. POST /api/auth/signup                                        │
│     - Create MongoDB User                                         │
│     - Generate Random Avatar                                      │
│     - Hash Password                                               │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. upsertStreamUser()                                           │
│     - Create Stream Chat User                                     │
│     - Set ID = MongoDB User ID                                    │
│     - Set Name & Profile Picture                                  │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. Generate JWT Token                                            │
│     - Sign with Secret Key                                        │
│     - Set in HTTP-only Cookie                                     │
│     - 7 Day Expiration                                            │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         USER ONBOARDING                           │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. PUT /api/auth/onboarding                                     │
│     - Update MongoDB User Profile                                 │
│     - Add Bio, Languages, Location                                │
│     - Set isOnboarded = true                                      │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. upsertStreamUser() (Again)                                   │
│     - Update Stream Chat User                                     │
│     - Sync Latest Profile Data                                    │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CHAT FUNCTIONALITY                           │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. GET /api/chats/token                                         │
│     - Verify JWT Authentication                                   │
│     - Extract User ID from req.user                               │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  7. generateStreamToken()                                         │
│     - Create Stream-specific JWT                                  │
│     - Sign with Stream API Secret                                 │
│     - Return to Client                                            │
└──────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  8. Frontend Connects to Stream                                   │
│     - Initialize Stream Client                                    │
│     - Connect with User ID & Token                                │
│     - Join Channels                                               │
│     - Send/Receive Messages                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

### What We Implemented

✅ **Stream Chat Integration**
- Initialized Stream Chat SDK
- Configured API credentials
- Created singleton client instance

✅ **User Synchronization**
- Auto-create Stream users on signup
- Update Stream profiles on onboarding
- Keep MongoDB and Stream users in sync

✅ **Token Generation**
- Secure server-side token creation
- User-specific authentication tokens
- Protected endpoint with JWT middleware

✅ **Utility Scripts**
- User deletion tool for cleanup
- Command-line interface
- Hard and soft delete options

✅ **Security**
- Environment variable configuration
- HTTP-only cookies for JWT
- Server-side token signing
- Authenticated endpoints

### Technologies Used

| Technology | Purpose |
|------------|---------|
| **Stream Chat SDK** | Real-time messaging infrastructure |
| **Express.js** | REST API framework |
| **JWT** | User authentication |
| **MongoDB** | User data storage |
| **Mongoose** | MongoDB object modeling |
| **dotenv** | Environment configuration |

---

## Next Steps & Future Enhancements

### Recommended Additions

1. **Channel Management**
   - Create group channels
   - Direct message channels
   - Channel memberships

2. **Message Features**
   - Send/receive messages
   - File uploads
   - Reactions and threads

3. **Presence Indicators**
   - Online/offline status
   - Typing indicators
   - Read receipts

4. **Push Notifications**
   - New message alerts
   - Mention notifications
   - Mobile push support

5. **Moderation**
   - Message flagging
   - User blocking
   - Channel moderation

6. **Analytics**
   - Message statistics
   - User engagement metrics
   - Channel activity tracking

---

## Summary

This implementation establishes the foundation for real-time chat functionality by:

1. **Integrating Stream Chat SDK** - Leveraging a robust, scalable chat infrastructure
2. **Synchronizing Users** - Maintaining consistency between MongoDB and Stream
3. **Securing Access** - Using JWT for authentication and token generation
4. **Providing API Endpoint** - Simple `/token` endpoint for client authentication
5. **Supporting Development** - Utility scripts for user management

The architecture separates concerns cleanly:
- **Authentication** handled by JWT middleware
- **User management** in MongoDB via Mongoose
- **Chat functionality** delegated to Stream Chat
- **Token generation** secured on backend

This approach allows the frontend to leverage Stream's powerful chat UI components while maintaining secure, centralized user management in your own database.
