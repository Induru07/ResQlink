# ResQlink - Flood Management System

ResQlink is a comprehensive web-based platform designed to manage flood relief operations efficiently. It connects victims, suppliers, contributors, and distributors to streamline the process of requesting and delivering aid during flood disasters.

## 🚀 Features

*   **Victim Portal**: Allows flood victims to register, report their status, and request specific needs (food, water, medicine, etc.).
*   **Supplier Portal**: Enables suppliers to register and list available goods and warehouse details.
*   **Contributor & Distributor Roles**: Facilitates the collection and distribution of relief items.
*   **Interactive Data Map**: Visualizes affected areas and resource locations using Leaflet maps.
*   **Admin Dashboard**: (Planned) For central management of operations.
*   **Multi-language Support**: Interface available in English, Sinhala, and Tamil.

## 🛠️ Tech Stack

### Frontend
*   **HTML5, CSS3, JavaScript (Vanilla)**
*   **Leaflet.js** (for interactive maps)
*   **Font Awesome** (for icons)

### Backend
*   **Node.js**
*   **Express.js**
*   **MongoDB** (with Mongoose)
*   **JWT** (JSON Web Tokens) for authentication
*   **Bcrypt** for password hashing

## 📂 Project Structure

```
ResQlink/
├── Backend/                # Node.js API Server
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose Database Models (Victim, Supplier, Admin)
│   ├── routes/             # API Routes (Auth, Home, Map)
│   ├── server.js           # Entry point for the backend
│   └── package.json        # Backend dependencies
│
├── Frontend/               # Client-side Application
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript logic
│   ├── images/             # Assets
│   ├── index.html          # Landing Page
│   ├── datamap.html        # Map Interface
│   ├── victimSignIn.html   # Victim Login
│   └── ...                 # Other HTML pages
│
└── README.md               # Project Documentation
```

## ⚙️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) installed.
*   [MongoDB](https://www.mongodb.com/) installed locally or a MongoDB Atlas connection string.

### 1. Backend Setup

1.  Navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: Ensure you have `express`, `mongoose`, `dotenv`, `cors`, `bcrypt`, and `jsonwebtoken` installed.*

3.  Configure Environment Variables:
    *   Create a `.env` file in the `Backend` folder.
    *   Add the following (replace with your actual values):
        ```env
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/resqlink
        JWT_SECRET=your_super_secret_key
        ```

4.  Start the Server:
    ```bash
    npm run dev
    # OR
    node server.js
    ```
    The server should run on `http://localhost:5000`.

### 2. Frontend Setup

1.  Navigate to the `Frontend` directory.
2.  You can simply open `index.html` in your browser.
3.  **Recommended**: Use a live server (like VS Code's "Live Server" extension) to serve the files to avoid CORS issues when fetching local assets or connecting to the backend.

## 🔗 API Endpoints

*   **Auth**:
    *   `POST /api/auth/victim/register` - Register a new victim
    *   `POST /api/auth/victim/login` - Login for victims
    *   `POST /api/auth/supplier/register` - Register a new supplier
    *   `POST /api/auth/supplier/login` - Login for suppliers

*   **General**:
    *   `GET /api/general/stats` - Get public stats for the home page

## 👥 Contributors

*   **Adeesha W. G. I** - Backend Developer
*   **Jayasinghe M. D. S. C** - Frontend Developer
*   **Wickramarathna W. W. N. D.** - Developer
*   **Rajapaksha W. T. D** - Developer
*   **Abeykoon T. B** - Developer

## 📄 License

This project is licensed under the ISC License.