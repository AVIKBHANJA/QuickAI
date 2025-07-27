# QuickAI Full Stack


## Prerequisites

- **Node.js**  
    [Download & Install Node.js](https://nodejs.org/en/download/)  
    *(Skip if already installed)*

---

## Server Setup

1. **Open Project Folder in VS Code**
2. **Setup Neon Database**  
     [Neon](https://neon.com)
3. **Create Database Table**  
     Use the SQL Editor to run:
     ```sql
     CREATE TABLE creations (
         id SERIAL PRIMARY KEY,
         user_id TEXT NOT NULL,
         prompt TEXT NOT NULL,
         content TEXT NOT NULL,
         type TEXT NOT NULL,
         publish BOOLEAN DEFAULT FALSE,
         likes TEXT[] DEFAULT '{}',
         created_at TIMESTAMPTZ DEFAULT NOW(),
         updated_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```
4. **Setup Cloudinary**  
     [Cloudinary Registration](https://cloudinary.com/users/register_free)
5. **Setup Clerk Authentication**  
     [Clerk](https://clerk.com/)
6. **Setup Clipdrop API**  
     [Clipdrop APIs](https://clipdrop.co/apis)
7. **Setup Gemini API**  
     [Gemini API](https://aistudio.google.com/apikey)
8. **Open `server` Folder in Terminal**
9. **Install Dependencies**
     ```bash
     npm install
     ```
10. **Run Server**
        ```bash
        npm run server
        ```

> **Note:** Ensure the server is running before starting the client.

---

## Client Setup

1. **Open `client` Folder in Terminal**
2. **Add Environment Variables**
3. **Install Dependencies**
     ```bash
     npm install
     ```
4. **Run Client**
     ```bash
     npm run dev
     ```

---
## Environment Variables
- **Server**  
  Create a `.env` file in the `server` folder with the following variables:
  ```plaintext
#Neon Databse
DATABASE_URL='postgres://username:password@host:port/database'

#Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

#Google Gemini
GEMINI_API_KEY=your_gemini_api_key

#Clipdrop
CLIPDROP_API_KEY=your_clipdrop_api_key

#Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
  ```
- **Client**
    Create a `.env` file in the `client` folder with the following variables:
    ```plaintext
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_BASE_URL=http://localhost:3000
    ```