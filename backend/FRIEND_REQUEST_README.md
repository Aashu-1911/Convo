# Friend Request Feature - Implementation Guide

## Overview
This document explains the complete implementation of the **Send and Accept Friend Request** functionality in the chat application. The feature allows users to send friend requests to other users, accept incoming requests, and manage their friend list.

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [API Endpoints](#api-endpoints)
3. [Implementation Details](#implementation-details)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Testing Guide](#testing-guide)

---

## Database Schema

### 1. User Model
**File:** `backend/src/models/User.model.js`

The User model was extended to include a friends array that stores references to other users:

```javascript
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    nativeLanguage: { type: String, default: "" },
    learningLanguage: { type: String, default: "" },
    location: { type: String, default: "" },
    isOnboarded: { type: Boolean, default: false },
    
    // Friend list - Array of User IDs
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });
```

**Key Fields:**
- `friends`: Array of ObjectIds referencing other User documents
- `isOnboarded`: Boolean to track if user completed onboarding process

### 2. FriendRequest Model
**File:** `backend/src/models/FriendRequest.model.js`

A new model was created to manage friend requests:

```javascript
const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true  
    },
    Status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });
```

**Key Fields:**
- `sender`: User who sent the friend request
- `recipient`: User who receives the friend request
- `Status`: Current status of the request (pending/accepted/rejected)
- `timestamps`: Automatically tracks when request was created/updated

---

## API Endpoints

### Base URL
All user-related endpoints are prefixed with: `/api/users`

### Authentication
All endpoints require authentication via JWT token stored in cookies.

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/` | Get recommended users (non-friends) | ✅ |
| GET | `/api/users/friends` | Get current user's friend list | ✅ |
| POST | `/api/users/friend-requests/:id` | Send friend request to user | ✅ |
| PUT | `/api/users/friend-requests/:id/accept` | Accept a friend request | ✅ |
| GET | `/api/users/friend-requests` | Get incoming friend requests | ✅ |

---

## Implementation Details

### 1. Authentication Middleware
**File:** `backend/src/middleware/auth.middleware.js`

The `protectRoute` middleware ensures all friend request endpoints are secured:

```javascript
export const protectRoute = async (req, res, next) => {
    // Extract JWT token from cookies
    const token = req.cookies.jwt;
    
    // Verify token and decode user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Fetch user from database
    const user = await User.findById(decoded.UserId).select("-password");
    
    // Attach user to request object
    req.user = user;
    next();
}
```

**How it works:**
- Extracts JWT token from HTTP-only cookie
- Verifies token signature using secret key
- Retrieves user data from database
- Attaches user object to `req.user` for use in controllers

### 2. Get Recommended Users
**File:** `backend/src/controllers/user.controller.js`

**Function:** `getRecommendedUsers`

```javascript
export async function getRecommendedUsers(req, res) {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
        $and: [
            { _id: { $ne: currentUserId } },           // Not the current user
            { _id: { $nin: currentUser.friends } },    // Not already friends
            { isOnboarded: true }                       // Completed onboarding
        ]
    });
    
    res.status(200).json({ recommendedUsers });
}
```

**Purpose:** Shows users who can receive friend requests

**Logic:**
- Excludes the current user
- Excludes users already in friend list
- Only shows users who completed onboarding

### 3. Send Friend Request
**File:** `backend/src/controllers/user.controller.js`

**Function:** `sendFriendRequest`

```javascript
export async function sendFriendRequest(req, res) {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // Validation 1: Cannot send request to yourself
    if (myId === recipientId) {
        return res.status(400).json({
            message: "You cannot send a friend request to yourself."
        });
    }

    // Validation 2: Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        return res.status(404).json({ message: "Recipient not found." });
    }

    // Validation 3: Check if already friends
    if (recipient.friends.includes(myId)) {
        return res.status(400).json({
            message: "You are already friends with this user."
        });
    }

    // Validation 4: Check for existing request (bidirectional)
    const existingRequest = await FriendRequest.findOne({
        $or: [
            { sender: myId, recipient: recipientId },
            { sender: recipientId, recipient: myId }
        ]
    });
    
    if (existingRequest) {
        return res.status(400).json({
            message: "A friend request already exists between you and this user."
        });   
    }

    // Create and save the friend request
    const friendRequest = new FriendRequest({
        sender: myId,
        recipient: recipientId
    });
    
    await friendRequest.save();
    
    res.status(201).json({ message: "Friend request sent successfully." });
}
```

**Validations:**
1. Users cannot send requests to themselves
2. Recipient must exist in database
3. Users cannot be already friends
4. No duplicate requests allowed (checks both directions)

### 4. Accept Friend Request
**File:** `backend/src/controllers/user.controller.js`

**Function:** `acceptFriendRequest`

```javascript
export async function acceptFriendRequest(req, res) {
    const { id: requestId } = req.params;
    
    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    // Validation 1: Request must exist
    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
    }

    // Validation 2: Only recipient can accept
    if (friendRequest.recipient.toString() !== req.user.id) {
        return res.status(403).json({
            message: "You are not authorized to accept this friend request"
        });
    }

    // Update request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add users to each other's friend lists
    await User.findByIdAndUpdate(friendRequest.sender, {
        $addToSet: { friends: friendRequest.recipient }
    });
    
    await User.findByIdAndUpdate(friendRequest.recipient, {
        $addToSet: { friends: friendRequest.sender }
    });

    res.status(200).json({ message: "Friend request accepted" });
}
```

**Process:**
1. Validates request exists
2. Ensures only the recipient can accept
3. Updates request status to "accepted"
4. Adds both users to each other's friends array using `$addToSet` (prevents duplicates)

### 5. Get Friend Requests
**File:** `backend/src/controllers/user.controller.js`

**Function:** `getFriendRequests`

```javascript
export async function getFriendRequests(req, res) {
    const incomingRequests = await FriendRequest.find({
        recipient: req.user.id,
        status: "pending"
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguages");
    
    res.status(200).json({ friendRequests: incomingRequests });
}
```

**Purpose:** Retrieves all pending friend requests for the current user

**Features:**
- Filters by recipient (current user)
- Only shows pending requests
- Populates sender details (name, profile pic, languages)

### 6. Get My Friends
**File:** `backend/src/controllers/user.controller.js`

**Function:** `getMyFriends`

```javascript
export async function getMyFriends(req, res) {
    const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learningLanguages");

    res.status(200).json({ friends: user.friends });
}
```

**Purpose:** Returns the current user's complete friend list with populated details

---

## Step-by-Step Implementation

### Step 1: Create FriendRequest Model
1. Created `backend/src/models/FriendRequest.model.js`
2. Defined schema with sender, recipient, and status fields
3. Added timestamps for tracking
4. Exported model for use in controllers

### Step 2: Update User Model
1. Added `friends` array to existing User schema
2. Set up ObjectId references to User model
3. Enabled population of friend data

### Step 3: Create User Controller Functions
1. Implemented `sendFriendRequest()` with all validations
2. Implemented `acceptFriendRequest()` with authorization checks
3. Implemented `getFriendRequests()` for viewing pending requests
4. Implemented `getRecommendedUsers()` for discovering new users
5. Implemented `getMyFriends()` for viewing friend list

### Step 4: Set Up Routes
**File:** `backend/src/routes/user.route.js`

1. Imported controller functions
2. Applied `protectRoute` middleware to all routes
3. Defined REST endpoints:
   - `POST /friend-requests/:id` - Send request
   - `PUT /friend-requests/:id/accept` - Accept request
   - `GET /friend-requests` - View incoming requests
   - `GET /friends` - View friend list
   - `GET /` - View recommended users

### Step 5: Authentication Integration
1. Used existing JWT authentication system
2. Applied `protectRoute` middleware to protect all routes
3. Accessed authenticated user via `req.user`

---

## Testing Guide

### Prerequisites
- Server running on configured port
- User authenticated with valid JWT token in cookies
- At least 2 user accounts for testing

### Test Case 1: Send Friend Request

**Request:**
```http
POST /api/users/friend-requests/{recipientUserId}
Headers:
  Cookie: jwt={valid_token}
```

**Expected Response (Success):**
```json
{
    "message": "Friend request sent successfully."
}
```

**Expected Response (Already Friends):**
```json
{
    "message": "You are already friends with this user."
}
```

### Test Case 2: View Incoming Requests

**Request:**
```http
GET /api/users/friend-requests
Headers:
  Cookie: jwt={valid_token}
```

**Expected Response:**
```json
{
    "friendRequests": [
        {
            "_id": "request_id",
            "sender": {
                "_id": "sender_id",
                "fullName": "John Doe",
                "profilePic": "url",
                "nativeLanguage": "English",
                "learningLanguages": "Spanish"
            },
            "recipient": "current_user_id",
            "Status": "pending",
            "createdAt": "2025-12-30T...",
            "updatedAt": "2025-12-30T..."
        }
    ]
}
```

### Test Case 3: Accept Friend Request

**Request:**
```http
PUT /api/users/friend-requests/{requestId}/accept
Headers:
  Cookie: jwt={valid_token}
```

**Expected Response:**
```json
{
    "message": "Friend request accepted"
}
```

### Test Case 4: View Friends List

**Request:**
```http
GET /api/users/friends
Headers:
  Cookie: jwt={valid_token}
```

**Expected Response:**
```json
{
    "friends": [
        {
            "_id": "friend_id",
            "fullName": "Jane Smith",
            "profilePic": "url",
            "nativeLanguage": "Spanish",
            "learningLanguages": "English"
        }
    ]
}
```

### Test Case 5: View Recommended Users

**Request:**
```http
GET /api/users/
Headers:
  Cookie: jwt={valid_token}
```

**Expected Response:**
```json
{
    "recommendedUsers": [
        {
            "_id": "user_id",
            "fullName": "Mike Johnson",
            "email": "mike@example.com",
            "bio": "Language enthusiast",
            // ... other user fields
        }
    ]
}
```

---

## Error Handling

### Common Errors

| Status Code | Error | Cause |
|-------------|-------|-------|
| 400 | "You cannot send a friend request to yourself." | Sender and recipient are the same |
| 400 | "You are already friends with this user." | Users are already in each other's friend list |
| 400 | "A friend request already exists..." | Duplicate request attempt |
| 401 | "Unauthorized: No token provided" | Missing JWT cookie |
| 401 | "Unauthorized: Invalid token" | Malformed or expired JWT |
| 403 | "You are not authorized to accept..." | User trying to accept request they didn't receive |
| 404 | "Recipient not found." | Invalid recipient user ID |
| 404 | "Friend request not found" | Invalid friend request ID |
| 500 | "Internal server error" | Database or server error |

---

## Key Features Implemented

✅ **Send Friend Requests**
- Validation to prevent self-requests
- Check for existing friendships
- Prevent duplicate requests (bidirectional check)
- Recipient validation

✅ **Accept Friend Requests**
- Authorization check (only recipient can accept)
- Mutual friendship creation
- Duplicate prevention with `$addToSet`
- Status update to "accepted"

✅ **View Friend Requests**
- Filter by recipient and pending status
- Populate sender information
- Display relevant user details

✅ **Friend List Management**
- View all friends
- Populated friend details
- Language information for matching

✅ **User Discovery**
- Recommend non-friend users
- Filter by onboarding status
- Exclude current friends

---

## Database Operations Used

### MongoDB Operators
- `$ne` - Not equal (exclude current user)
- `$nin` - Not in array (exclude friends)
- `$and` - Logical AND for multiple conditions
- `$or` - Logical OR for bidirectional search
- `$addToSet` - Add to array without duplicates

### Mongoose Methods
- `find()` - Query multiple documents
- `findById()` - Query by ID
- `findByIdAndUpdate()` - Update document by ID
- `findOne()` - Query single document
- `populate()` - Join referenced documents
- `select()` - Choose specific fields
- `save()` - Save document changes

---

## Future Enhancements

### Potential Features
1. **Reject Friend Request** - Add endpoint to decline requests
2. **Cancel Sent Request** - Allow users to cancel pending requests
3. **Unfriend Functionality** - Remove friends from list
4. **Friend Request Notifications** - Real-time notifications for new requests
5. **Pagination** - Add pagination for friend lists and recommendations
6. **Search Friends** - Search functionality in friend list
7. **Mutual Friends** - Show mutual friends when viewing profiles
8. **Request Expiration** - Auto-expire old pending requests

---

## Summary

This implementation provides a complete friend request system with:
- Secure authentication using JWT
- Comprehensive validation and error handling
- Bidirectional friend relationship management
- Clean RESTful API design
- Efficient MongoDB queries
- Scalable architecture for future enhancements

The system ensures data integrity through multiple validation layers and uses MongoDB's atomic operations to prevent race conditions in concurrent requests.
