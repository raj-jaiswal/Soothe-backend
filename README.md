# Soothe Backend

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Song Routes](#song-routes)
  - [User Routes](#user-routes)
  - [Favorites Routes](#favorites-routes)
  - [Personal Playlist Routes](#personal-playlist-routes)
  - [Public Playlist Routes](#public-playlist-routes)
  - [Friends Routes](#friends-routes)
  - [Chat Routes](#chat-routes)
- [Real-Time Features](#real-time-features)
- [Database Structure](#database-structure)
- [External Services](#external-services)
- [Docker Deployment](#docker-deployment)
- [Scripts](#scripts)

---

## Project Overview

**Soothe** is a comprehensive music streaming and social platform backend built with Node.js and Express. It provides features for music discovery, playlist management, social interactions, and mood-based song recommendations powered by AI. The application combines RESTful APIs with real-time WebSocket communication for chat functionality.

The backend is fully containerized and cloud-ready, utilizing AWS services for storage and database management.

---

## Tech Stack

### Core Framework
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework (v5.2.1)
- **Socket.io** - Real-time bidirectional communication (v4.8.3)

### Authentication & Security
- **JWT (JsonWebToken)** - Token-based authentication (v9.0.3)
- **bcrypt** - Password hashing (v6.0.0)
- **CORS** - Cross-Origin Resource Sharing (v2.8.6)

### Cloud & Storage
- **AWS SDK** - AWS services integration (v2.1693.0)
  - S3 - Song file storage
  - DynamoDB - NoSQL database
- **Multer** - File upload handling (v2.1.1)

### AI & ML
- **Google Generative AI (Gemini)** - AI model for recommendations
- **Pinecone** - Vector database for semantic search

### Email & Communication
- **Nodemailer** - Email service (v8.0.3)
- **Brevo SMTP** - Email provider

### Utilities
- **axios** - HTTP client (v1.14.0)
- **uuid** - Unique ID generation (v13.0.0)
- **dotenv** - Environment variable management (v17.4.1)

### Development
- **nodemon** - Auto-restart during development (v3.1.14)

---

## ✨ Features

1. **User Authentication**
   - Sign up with OTP verification
   - JWT-based login and token verification
   - Secure password hashing with bcrypt

2. **Music Management**
   - Browse and stream songs
   - AI-powered mood-based song suggestions
   - Song metadata retrieval
   - Streaming URL generation

3. **User Profiles**
   - Profile management and updates
   - Profile picture upload to S3
   - Music history tracking
   - Top songs statistics

4. **Playlist System**
   - Personal playlists (create, rename, delete, manage songs)
   - Public playlists for community sharing
   - Song addition and removal from playlists

5. **Social Features**
   - Friend system with requests
   - User search functionality
   - Friend request acceptance/rejection

6. **Favorites System**
   - Add/remove favorite songs
   - View all favorite songs

7. **Real-Time Chat**
   - WebSocket-based messaging
   - End-to-end encrypted messages
   - Chat history persistence
   - Message sharing

---

## Project Structure

```
Soothe-be/
├── src/
│   ├── app.js                          # Express app setup and route registration
│   ├── server.js                       # Server initialization with Socket.io
│   │
│   ├── config/
│   │   ├── aws.js                      # AWS SDK configuration (S3, DynamoDB)
│   │   └── mail.js                     # Email/Brevo SMTP configuration
│   │
│   ├── controllers/                    # Business logic layer
│   │   ├── auth.controller.js          # Authentication logic
│   │   ├── chat.controller.js          # Chat management
│   │   ├── favourites.controller.js    # Favorite songs management
│   │   ├── friends.controller.js       # Friend system logic
│   │   ├── personalPlaylist.controller.js  # User's playlists
│   │   ├── publicPlaylist.controller.js    # Community playlists
│   │   ├── song.controller.js          # Song retrieval and recommendations
│   │   └── user.controller.js          # User profile management
│   │
│   ├── db/                             # Data access layer (Repository pattern)
│   │   ├── chats.repo.js               # Chat operations
│   │   ├── favourites.repo.js          # Favorites operations
│   │   ├── friends.repo.js             # Friends operations
│   │   ├── personalPlaylists.repo.js   # Personal playlist operations
│   │   ├── publicPlaylists.repo.js     # Public playlist operations
│   │   ├── songs.repo.js               # Song operations
│   │   └── users.repo.js               # User operations
│   │
│   ├── middleware/
│   │   └── auth.middleware.js          # JWT token verification
│   │
│   ├── routes/                         # API endpoint definitions
│   │   ├── auth.routes.js              # /api/auth endpoints
│   │   ├── chat.routes.js              # /api/chats endpoints
│   │   ├── favourites.routes.js        # /api/favourites endpoints
│   │   ├── friends.routes.js           # /api/friends endpoints
│   │   ├── personalPlaylist.routes.js  # /api/personal-playlists endpoints
│   │   ├── publicPlaylist.routes.js    # /api/public-playlists endpoints
│   │   ├── song.routes.js              # /api/songs endpoints
│   │   └── user.routes.js              # /api/user endpoints
│   │
│   ├── scripts/                        # Utility scripts
│   │   ├── db-init.js                  # Database initialization script
│   │   ├── embedSongs.js               # Generate song embeddings for AI
│   │   ├── seedPublicPlaylists.js      # Populate public playlists
│   │   └── seedsongs.js                # Populate song database
│   │
│   ├── services/                       # Business logic services (if needed)
│   │
│   ├── sockets/
│   │   └── chat.socket.js              # WebSocket handlers for real-time chat
│   │
│   └── utils/
│       └── jwt.js                      # JWT token creation and verification
│
├── dockerfile                           # Docker image configuration
├── docker-compose.yml                   # Multi-container orchestration
├── package.json                         # Project dependencies and scripts
├── env-example.txt                      # Environment variables template
├── app.json                             # Expo configuration
└── README.md                            # This file
```

---

## Environment Variables

Create a `.env` file at the root of the project based on the `env-example.txt` template:

```env
# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=30d

# AWS Configuration (S3 and DynamoDB)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET=soothe-songs

# DynamoDB Table Names
USERS_TABLE=Users
SONGS_TABLE=Songs
CHATS_TABLE=Chats
PERSONAL_PLAYLISTS_TABLE=PersonalPlaylists
PUBLIC_PLAYLISTS_TABLE=PublicPlaylists
FAVOURITES_TABLE=Favourites

# Email Configuration (Brevo SMTP)
BREVO_SMTP_USER=your_brevo_smtp_user
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_FROM_EMAIL=your_admin_email@example.com

# AI & Vector Database Configuration
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
```


## Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- AWS account with S3 and DynamoDB access
- Google Generative AI API key
- Pinecone account and API key
- Brevo (formerly Sendinblue) account for email

### Step 1: Clone the Repository

```bash
git clone https://github.com/raj-jaiswal/Soothe-backend.git
cd Soothe-be
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

```bash
cp env-example.txt .env
```

Edit the `.env` file with your actual credentials:
- AWS keys and S3 bucket name
- JWT secret (generate a strong random string)
- Email service credentials (Brevo SMTP)
- AI service API keys (Gemini, Pinecone)

### Step 4: Initialize Database (Optional)

If using DynamoDB, initialize tables:

```bash
npm run init
```

### Step 5: Seed Data (Optional)

Populate your database with initial data:

```bash
node src/scripts/seedsongs.js          # Add songs
node src/scripts/seedPublicPlaylists.js # Add public playlists
node src/scripts/embedSongs.js         # Generate embeddings for AI recommendations
```

---

## Running the Project

### Development Mode

Start the server with automatic restarts on file changes:

```bash
npm run dev
```

The server will start on the specified PORT (default: 3000).

### Production Mode

Start the server:

```bash
npm start
```

### Health Check

Once running, verify the server is healthy:

```bash
curl http://localhost:3000/health
```

Expected response: `{ "status": "OK" }`

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

All requests (except authentication endpoints) require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Authentication Routes
**Base Path:** `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register a new user with OTP verification | No |
| POST | `/verify-otp` | Verify OTP sent to email | No |
| POST | `/login` | Login and receive JWT token | No |
| GET | `/verify-token` | Verify JWT token validity | No |

**Example Requests:**

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePassword123"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePassword123"}'

# Verify token
curl -X GET http://localhost:3000/api/auth/verify-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Song Routes
**Base Path:** `/api/songs` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all available songs |
| GET | `/:id/stream` | Get streaming URL for a song |
| GET | `/:id/metadata` | Get song metadata |
| POST | `/suggest` | Get AI-powered mood-based song suggestions |

**Example Requests:**

```bash
# Get all songs
curl -X GET http://localhost:3000/api/songs \
  -H "Authorization: Bearer <token>"

# Get song stream URL
curl -X GET http://localhost:3000/api/songs/song123/stream \
  -H "Authorization: Bearer <token>"

# Get song metadata
curl -X GET http://localhost:3000/api/songs/song123/metadata \
  -H "Authorization: Bearer <token>"

# Get mood-based suggestions
curl -X POST http://localhost:3000/api/songs/suggest \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mood": "relaxed", "count": 10}'
```

---

### User Routes
**Base Path:** `/api/user` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |
| GET | `/me/history` | Get user's listening history |
| GET | `/me/top-songs` | Get user's top played songs |
| PUT | `/me` | Update user profile |
| POST | `/me/profile-pic` | Upload profile picture to S3 |

**Example Requests:**

```bash
# Get profile
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer <token>"

# Get listening history
curl -X GET http://localhost:3000/api/user/me/history \
  -H "Authorization: Bearer <token>"

# Get top songs
curl -X GET http://localhost:3000/api/user/me/top-songs \
  -H "Authorization: Bearer <token>"

# Update profile
curl -X PUT http://localhost:3000/api/user/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username": "newUsername", "bio": "Music lover"}'

# Upload profile picture
curl -X POST http://localhost:3000/api/user/me/profile-pic \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/image.jpg"
```

---

### Favorites Routes
**Base Path:** `/api/favourites` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all favorite songs |
| POST | `/:songId` | Add song to favorites |
| DELETE | `/:songId` | Remove song from favorites |

**Example Requests:**

```bash
# Get favorites
curl -X GET http://localhost:3000/api/favourites \
  -H "Authorization: Bearer <token>"

# Add to favorites
curl -X POST http://localhost:3000/api/favourites/song123 \
  -H "Authorization: Bearer <token>"

# Remove from favorites
curl -X DELETE http://localhost:3000/api/favourites/song123 \
  -H "Authorization: Bearer <token>"
```

---

### Personal Playlist Routes
**Base Path:** `/api/personal-playlists` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new personal playlist |
| GET | `/` | Get all user's personal playlists |
| PATCH | `/:playlistId` | Rename a playlist |
| POST | `/:playlistId/songs` | Add song to playlist |
| DELETE | `/:playlistId/songs/:songId` | Remove song from playlist |
| DELETE | `/:playlistId` | Delete entire playlist |

**Example Requests:**

```bash
# Create playlist
curl -X POST http://localhost:3000/api/personal-playlists \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Chill Vibes", "description": "Relaxing tracks"}'

# Get all playlists
curl -X GET http://localhost:3000/api/personal-playlists \
  -H "Authorization: Bearer <token>"

# Rename playlist
curl -X PATCH http://localhost:3000/api/personal-playlists/playlist123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Relaxing Beats"}'

# Add song to playlist
curl -X POST http://localhost:3000/api/personal-playlists/playlist123/songs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"songId": "song456"}'

# Remove song from playlist
curl -X DELETE http://localhost:3000/api/personal-playlists/playlist123/songs/song456 \
  -H "Authorization: Bearer <token>"

# Delete playlist
curl -X DELETE http://localhost:3000/api/personal-playlists/playlist123 \
  -H "Authorization: Bearer <token>"
```

---

### Public Playlist Routes
**Base Path:** `/api/public-playlists` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a public playlist |
| GET | `/` | Get all public playlists |
| GET | `/:id` | Get specific public playlist by ID |

**Example Requests:**

```bash
# Create public playlist
curl -X POST http://localhost:3000/api/public-playlists \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Official: Summer Hits", "description": "Top Summer tracks"}'

# Get all public playlists
curl -X GET http://localhost:3000/api/public-playlists \
  -H "Authorization: Bearer <token>"

# Get public playlist by ID
curl -X GET http://localhost:3000/api/public-playlists/playlist789 \
  -H "Authorization: Bearer <token>"
```

---

### Friends Routes
**Base Path:** `/api/friends` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?query=username` | Search for users |
| GET | `/` | Get current user's friends list |
| POST | `/request` | Send friend request |
| POST | `/accept` | Accept friend request |
| POST | `/reject` | Reject friend request |

**Example Requests:**

```bash
# Search users
curl -X GET "http://localhost:3000/api/friends/search?query=john" \
  -H "Authorization: Bearer <token>"

# Get friends list
curl -X GET http://localhost:3000/api/friends \
  -H "Authorization: Bearer <token>"

# Send friend request
curl -X POST http://localhost:3000/api/friends/request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"friendUsername": "john_doe"}'

# Accept friend request
curl -X POST http://localhost:3000/api/friends/accept \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"requesterUsername": "jane_doe"}'

# Reject friend request
curl -X POST http://localhost:3000/api/friends/reject \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"requesterUsername": "jane_doe"}'
```

---

### Chat Routes
**Base Path:** `/api/chats` | **Auth Required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all user's chats |
| POST | `/share` | Share chat message |
| GET | `/:chatId/messages` | Get chat history |

**Example Requests:**

```bash
# Get all chats
curl -X GET http://localhost:3000/api/chats \
  -H "Authorization: Bearer <token>"

# Share message
curl -X POST http://localhost:3000/api/chats/share \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"chatId": "chat123", "message": "Check this out!"}'

# Get chat history
curl -X GET http://localhost:3000/api/chats/chat123/messages \
  -H "Authorization: Bearer <token>"
```

---

## Real-Time Features

### WebSocket Chat

The application uses Socket.io for real-time messaging. Client connections are authenticated using JWT tokens.

**Connection Example (JavaScript):**

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

// Register connection handler
socket.on('connect', () => {
  console.log('Connected to server');
});

// Join a chat room
socket.emit('join', { chatId: 'chat_room_id' });

// Send encrypted message
socket.emit('sendMessage', {
  chatId: 'chat_room_id',
  recipientUsername: 'friend_username',
  ciphertext: 'encrypted_message_content',
  iv: 'initialization_vector',
  messageType: 'text' // or 'image', 'file', etc.
});

// Listen for messages
socket.on('message', (data) => {
  console.log('New message:', data);
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

**Socket Events:**
- `join` - Join a chat room
- `sendMessage` - Send encrypted message to chat room
- `message` - Receive messages from chat room

**Message Structure:**
```json
{
  "chatId": "unique_chat_identifier",
  "recipientUsername": "recipient_username",
  "ciphertext": "encrypted_message_content",
  "iv": "initialization_vector_for_decryption",
  "messageType": "text"
}
```

Messages are end-to-end encrypted and stored in DynamoDB with the following key structure:
- **Partition Key (PK):** `CHAT#{chatId}`
- **Sort Key (SK):** `MSG#{timestamp}#{uuid}`

---

## Database Structure

The application uses **AWS DynamoDB** for data persistence. The following tables are required:

### Table: Users
Stores user account information and credentials.

### Table: Songs
Contains song metadata, file references, and streaming information.

### Table: Chats
Stores encrypted messages with chat room organization.

### Table: PersonalPlaylists
User-created playlists with song references.

### Table: PublicPlaylists
Community-shared playlists.

### Table: Favourites
Mapping of users to their favorite songs.

### Table: Friends
Friend connections and friend request status.

---

## External Services

### AWS (Cloud Storage & Database)
- **S3:** Song file storage and profile picture uploads
- **DynamoDB:** NoSQL database for all application data

### Google Generative AI (Gemini)
- Mood-based song recommendations
- Natural language processing for music discovery

### Pinecone
- Vector database for semantic search
- Similarity-based song recommendations through embeddings

### Brevo (Email Service)
- OTP verification emails
- Transactional email notifications
- User communication

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t soothe-backend:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container
- Expose port 3000
- Load environment variables from `.env` file
- Auto-restart on failure (unless-stopped policy)

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  soothe-backend:
    build: .
    container_name: soothe-backend-container
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

### Stop Docker Container

```bash
docker-compose down
```

### View Logs

```bash
docker logs soothe-backend-container
docker logs -f soothe-backend-container  # Follow logs
```

---

## Scripts

### Database Initialization
Initialize DynamoDB tables:
```bash
npm run init
```

### Seed Songs
Populate the Songs table with initial data:
```bash
node src/scripts/seedsongs.js
```

### Seed Public Playlists
Populate public playlists:
```bash
node src/scripts/seedPublicPlaylists.js
```

### Generate Song Embeddings
Create vector embeddings for AI-powered recommendations:
```bash
node src/scripts/embedSongs.js
```

---

## Project Scripts

In `package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",           // Production start
    "dev": "nodemon src/server.js",          // Development with auto-restart
    "init": "node .\\src\\scripts\\db-init.js" // Database initialization
  }
}
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## License

MIT License

---

## Contributors

- **Divya Swaroop Jaiswal** - https://github.com/raj-jaiswal
- **Darla Sravan Kumar** - https://github.com/DSK-champ
- **Divya Swaroop Jaiswal** - https://github.com/raj-jaiswal
- **Vivekananda Katakam** - https://github.com/VivekanandaK123
- **Parth Agarwal** - https://github.com/parthagarwal8910
- **Vennela Jangiti** - https://github.com/vennelajangiti17
- **Shivam Prakash** - https://github.com/Phoenix1729398

---

## Related Repositories

- [Soothe Frontend](https://github.com/raj-jaiswal/soothe)
---
