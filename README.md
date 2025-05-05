# Lost_Found-Portal


A Node.js-powered full-stack application that allows users to report and browse lost and found items within an organization or community. This project includes real-time notifications, user authentication, and a clean, interactive frontend.

## 🚀 Features

- 🔐 **User Authentication** – Secure login and signup system using JWT and cookies.
- 📝 **Post Lost/Found Reports** – Users can create entries for lost or found items.
- 📋 **Dashboard Interface** – View and manage all posted entries.
- 🛎️ **Real-time Notifications** – Instant alerts using WebSockets when a new item is posted.
- 📁 **MongoDB Integration** – Persistent data storage for users and items.
- 📬 **Email Notification (Pluggable)** – Structure ready for email alerts or confirmations.
- 🔒 **Token-Based API Routes** – JWT-secured backend APIs for better access control.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time:** Socket.IO
- **Security:** JWT, cookie-parser, dotenv

## 📁 Project Structure

```bash
Lost_Found-Portal/
│ ├── Frontend/                # Static UI pages along with JS Files
│ ├── routes/                  # API route handlers (auth, notify, DB)
│ ├── app.js                   # Express server setup
│ ├── .env.example             # Sample environment config
│ ├── package.json             # Node dependencies
└── ...


🧪 Setup Instructions

1. Clone the repository

    git clone https://github.com/ritain-sood/Lost_Found-Portal.git
    cd Lost_Found-Portal

2. Install dependencies

    npm install

3. Setup environment variables
Create .env using the example provided:

    cp .env.example .env

Update with your MongoDB URI and secret key and other notification Email and Pass.


4. Run the server

    npm start



## 📄 License

The **Lost & Found Portal** project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

You are free to use, modify, and distribute this software for personal, academic, or commercial purposes. Please ensure that the original copyright and license notice remain intact in all copies or significant portions of the project.

This software is provided "as is", without warranty of any kind. The authors are not liable for any damages or issues arising from its use.


