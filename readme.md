# Cosmio - Intelligent Multi-Modal Storage System

Cosmio is an advanced, intelligent storage platform that automatically categorizes and stores your files based on their type and structure. It combines the power of cloud storage, multiple databases, and smart schema analysis to provide seamless file management.

## Features

- **Automatic Media Categorization**: Images and videos are automatically detected and organized into separate folders
- **Intelligent Database Routing**: JSON files are analyzed and routed to the appropriate database:
  - **PostgreSQL (Neon)**: For flat, relational data with consistent schemas
  - **MongoDB**: For deeply nested, complex, or dynamic data structures
- **Folder Organization**: Browse files through an intuitive folder structure:
  - Images folder
  - Videos folder
  - SQL folder (PostgreSQL data)
  - NoSQL folder (MongoDB data)
- **JSON Data Viewer**: View JSON file contents directly in your browser with syntax highlighting
- **Cloud Storage**: Media files are stored on Cloudinary for optimized delivery
- **Real-time Updates**: Live folder counts and auto-refreshing file lists
- **Upload History**: Track all uploads with detailed logs including timestamps and metadata
- **Complete File Management**: Delete files from all storage locations (Cloudinary, databases, and Firebase) with a single click

## Architecture

Cosmio uses a microservices architecture with three main components:

### Frontend (React + Vite)
- Modern React application with Tailwind CSS
- Drag-and-drop file uploads
- Folder-based file browsing
- JSON viewer with syntax highlighting

### Backend (Node.js + Express)
- RESTful API for file management
- Intelligent schema analysis and database routing
- Integration with Cloudinary and Firebase
- Database operations for PostgreSQL and MongoDB

### AI Service (Flask)
- MIME-type based media detection
- Simple and efficient categorization

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, Firebase Admin SDK
- **AI Service**: Python, Flask
- **Databases**:
  - PostgreSQL (Neon) - for relational data
  - MongoDB - for document/nested data
  - Firebase Realtime Database - for metadata
- **Storage**: Cloudinary
- **File Upload**: Multer, React Dropzone

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- PostgreSQL database (Neon account)
- MongoDB database
- Firebase project
- Cloudinary account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AuraVerse
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5002

# Firebase
FIREBASE_DATABASE_URL=your_firebase_database_url

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PostgreSQL (Neon)
DATABASE_URL=your_neon_postgres_url

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

Place your `serviceAccountKey.json` file in the `backend` directory (Firebase service account key).

Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:5002`

### 3. Micro-Service Setup

```bash
cd micro-service
pip install -r requirements.txt
```

Start the AI service:

```bash
python app.py
```

The AI service will run on `http://localhost:5001`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5002/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Upload Files**:
   - Navigate to the "Upload" tab
   - Drag and drop media files (images/videos) or JSON files
   - Files are automatically processed and categorized

2. **Browse Files**:
   - Switch to the "Browse Files" tab
   - Select a folder (All Files, Images, Videos, SQL, NoSQL)
   - View file details, thumbnails, and metadata
   - Click the eye icon on JSON files to view their contents
   - Click the trash icon to delete files

3. **View Logs**:
   - Navigate to the "Logs" tab
   - See upload history with timestamps and thumbnails
   - Track all file processing activities

## Database Routing Logic

Cosmio intelligently analyzes your JSON files to determine the best storage solution:

**Routes to PostgreSQL when:**
- Data has flat structure (depth ≤ 2)
- Schema is consistent across records
- Contains relational patterns (foreign keys)
- No nested arrays detected

**Routes to MongoDB when:**
- Data has deep nesting (depth > 3)
- Contains nested arrays
- Schema is inconsistent or dynamic
- Complex document structure

## Live Demo

[Live link will be added here]

## Project Structure

```
AuraVerse/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── App.jsx       # Main app component
│   └── package.json
├── backend/              # Node.js backend
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── databaseManager.js  # Schema analysis & routing
│   │   ├── mediaProcessor.js   # Media file handling
│   │   └── jsonProcessor.js    # JSON file handling
│   └── server.js        # Express server
├── ai-service/          # Flask AI service
│   ├── app.py          # Media classification
│   └── requirements.txt
└── readme.md
```

