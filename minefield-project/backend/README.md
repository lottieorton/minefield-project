# 💣 Fullstack JS Minesweeper

A robust, fullstack implementation of the classic Minesweeper game. This project features a secure backend, persistent data storage, and multiple authentication methods, demonstrating a modern approach to web application security and state management.

---

## 🎮 How to Play



1.  **Set the Stage:** Select your desired difficulty level from the options menu.
2.  **Initialize:** Press the **Start Game** button to generate the board.
3.  **Objective:** Clear every cell on the board that does not contain a mine.
4.  **Strategy:** * **Left-Click** a cell to reveal what’s underneath.
    * **Numbers** indicate how many mines are touching that specific cell.
    * **Flagging:** Use your logic to identify mines and avoid clicking them!
5.  **Win Condition:** The game is won once all safe cells are revealed and only the mines remain hidden.

---

## ✨ Features

* **Dynamic Gameplay:** Full Minesweeper logic including board generation, tile flagging, and win/loss state detection.
* **Dual Authentication System:**
    * **Local Auth:** Custom account creation and session-based login.
    * **OAuth 2.0:** Integrated **Google 3rd-party API** for seamless sign-in.
* **User Profiles:** Dedicated dashboard to review and update personal profile details.
* **Persistent Scoring:** Game results are saved to a database, allowing users to retrieve and track their historical scores.
* **Security Architecture:** * **Protected Routes:** Sensitive account data is shielded by custom authentication middleware.
    * **Database Security:** All queries use **prepared statements** to prevent SQL injection.
    * **Data Validation:** Strict validation for all incoming database requests.

---

## 🛠 Tech Stack

| Layer          | Technology                                   |
| :------------- | :------------------------------------------- |
| **Frontend** | JavaScript (ES6+), Production build via `npx serve` |
| **Backend** | Node.js                                      |
| **Database** | SQL-based with Prepared Statements           |
| **Auth** | Google OAuth 2.0 & Session Middleware        |

---

## 🚀 Installation & Setup

### 1. Environment Configuration
Create a `.env` file in your backend directory to manage your secrets:

```env
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## Backend setup

# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server
node index.js

---

## Frontend setup

# Navigate to the frontend directory
cd frontend

# Install dependencies and build the production bundle
npm install && NODE_ENV=production npm run build

# Serve the build folder
npx serve -s build

--- 

## Database setup

# Create an empty database

# Run the queries contained in the database file:
database_create_queries.rtf

--- 

## 🛡 Security Implementation
* This application emphasizes secure coding practices:

* Authentication Middleware: Ensures that only verified users can access or modify account-specific data.

* Parameterized Queries: By using prepared statements, the app ensures that user input is never executed as code, neutralizing SQL injection risks.

* Environment Isolation: Sensitive API keys and environment settings are managed through process.env to keep credentials out of the source code.

---

## 📜 License
* This project is licensed under the MIT License.

* Summary: You can do almost anything you want with this software as long as you provide attribution back to the author and don’t hold them liable. It is one of the most popular licenses for open-source and portfolio projects.