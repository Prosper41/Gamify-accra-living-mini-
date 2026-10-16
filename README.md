# 🇬🇭 Accra Life Mini

**A 3D Ghanaian life-simulation game built with Next.js, Django REST Framework, and PostgreSQL.**

Accra Life Mini is a browser-based life-simulation game inspired by everyday life in Accra, Ghana. Players can create accounts, customize their characters, explore a 3D city, earn money through jobs, and purchase items from local shops.

The project combines interactive 3D graphics with a full-stack application architecture, including JWT authentication, REST APIs, and persistent player data.

## 🎮 Features

- **User Registration and Login:** Create an account and securely sign in.
- **Password Reset:** Recover access to an account through a password-reset link.
- **Character Creation:** Set up a playable character.
- **3D City Exploration:** Navigate a Ghana-inspired urban environment.
- **Player Movement:** Explore the city using keyboard controls.
- **Player Economy:** Begin with GH₵5,000 and manage an in-game balance.
- **Delivery Jobs:** Complete deliveries to earn GH₵200 per successful job.
- **MiniMart Shopping:** Purchase items using in-game money.
- **Player Statistics:** View health, energy, and available balance.
- **Persistent Progress:** Store player information and game progress in PostgreSQL.
- **Online Player Count:** Display the number of connected players.
- **JWT Authentication:** Secure API access using access and refresh tokens.
- **Logout:** End the current user session.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| 3D Rendering | Three.js, React Three Fiber |
| Backend | Python, Django 6.1, Django REST Framework |
| Database | PostgreSQL |
| Authentication | Django SimpleJWT |
| Email | Brevo SMTP / Django Console Email Backend |
| Styling | CSS |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

```text
                    PLAYER
                      |
                      v
              Next.js Frontend
             React + TypeScript
                      |
                 REST API
                      |
                      v
               Django Backend
            Django REST Framework
                      |
          +-----------+-----------+
          |                       |
          v                       v
    Authentication          Game Services
      JWT Tokens            Player Logic
          |                 Jobs / Shops
          |                       |
          +-----------+-----------+
                      |
                      v
                 PostgreSQL
                      |
          +-----------+-----------+
          |           |           |
        Users       Players     Game Data
```

The frontend handles user interaction, 3D rendering, and gameplay interfaces.

The Django backend manages authentication, password recovery, business logic, game operations, and database persistence.

PostgreSQL stores user accounts, player information, and game-related data.

## 📁 Project Structure

```text
Gamify-accra-living-mini-/
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── jobs/
│   ├── players/
│   ├── shops/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── game/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   └── game/
│   ├── lib/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

This is a simplified overview of the main project directories.

## 🚀 Getting Started

### Prerequisites

Install the following tools before running the application:

- Node.js and npm
- Python (a version compatible with Django 6.1)
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Prosper41/Gamify-accra-living-mini-.git
cd Gamify-accra-living-mini-
```

### 2. Configure the Backend

Navigate to the backend directory:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required Python dependencies:

```powershell
pip install -r requirements.txt
```

Copy the environment configuration template:

```powershell
Copy-Item .env.example .env
```

Open `.env` and update the values for your local environment.

Example configuration:

```dotenv
DJANGO_SECRET_KEY=replace-with-a-generated-secret-key
DJANGO_DEBUG=True

DB_NAME=accra_life_mini
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=127.0.0.1
DB_PORT=5432

FRONTEND_URL=http://localhost:3000
```

Generate a Django secret key using:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the generated key into `DJANGO_SECRET_KEY` in your private `.env` file.

**Important:** Never commit your actual `.env` file, database password, Django secret key, or SMTP credentials to GitHub.

### 3. Configure PostgreSQL

Ensure PostgreSQL is installed and running.

Create a database matching the `DB_NAME` value in your `.env` file.

For example, using PostgreSQL's SQL interface:

```sql
CREATE DATABASE accra_life_mini;
```

If you use the default `postgres` account, ensure `DB_USER` and `DB_PASSWORD` match your local PostgreSQL credentials.

Apply Django database migrations:

```powershell
python manage.py migrate
```

Check the Django configuration:

```powershell
python manage.py check
```

Start the backend development server:

```powershell
python manage.py runserver
```

The backend API will be available at:

http://127.0.0.1:8000

Keep this terminal running while testing the application.

### 4. Configure the Frontend

Open a second terminal and navigate to the frontend directory from the repository root:

```powershell
cd frontend
```

Install the frontend dependencies:

```powershell
npm install
```

Copy the frontend environment template:

```powershell
Copy-Item .env.example .env.local
```

Configure the backend API URL:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start the frontend development server:

```powershell
npm run dev
```

Open the application in your browser:

http://localhost:3000

If port 3000 is already occupied, Next.js may select another available port. If that happens, update `FRONTEND_URL` in the backend environment configuration accordingly and restart Django.

## 🔐 Authentication and Security

Accra Life Mini uses Django's authentication system together with Django REST Framework and SimpleJWT.

### User Registration

When a user registers:

1. The frontend submits registration details to the Django backend.
2. Django validates the submitted information.
3. Django's `create_user()` hashes the password before saving it.
4. The user account is stored in PostgreSQL.

Passwords are not stored in plaintext.

### User Login

After successful authentication, the backend issues:

- **Access Token:** Used to authenticate protected API requests.
- **Refresh Token:** Used to obtain a new access token when required.

The frontend implements token-refresh handling and a logout mechanism.

### Authentication API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new account |
| POST | `/api/auth/login/` | Authenticate and obtain JWT tokens |
| POST | `/api/auth/refresh/` | Refresh an access token |
| GET | `/api/auth/me/` | Retrieve authenticated user information |
| POST | `/api/auth/forgot-password/` | Request a password-reset link |
| POST | `/api/auth/reset-password/` | Reset a password using a valid token |

### Password Reset — Local Development

Accra Life Mini supports password recovery using Django's password-reset token mechanism.

The backend supports two email delivery modes:

| Mode | Behaviour |
|---|---|
| Brevo SMTP | Sends password-reset emails to the user's inbox when valid credentials are configured |
| Django Console Email Backend | Prints password-reset emails in the Django terminal when Brevo credentials are absent |

**Brevo SMTP credentials are not required to test password reset locally.**

#### Testing Password Reset Without Brevo

1. Start the Django backend using `python manage.py runserver`.
2. Start the Next.js frontend using `npm run dev`.
3. Register an account or log out of an existing account.
4. Navigate to the **Forgot Password** page.
5. Enter the email address associated with the account.
6. Check the Django terminal for the generated password-reset email.
7. Copy the password-reset URL from the terminal.
8. Open the URL in your browser.
9. Enter and confirm a new password.
10. Return to the login page and sign in using the new password.

In console mode, the email is not delivered to the inbox. Instead, its contents are displayed in the terminal where Django is running.

#### Optional: Enable Real Email Delivery

To enable email delivery using Brevo, add valid SMTP credentials to your private backend `.env` file:

```dotenv
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your_brevo_smtp_login
BREVO_SMTP_KEY=your_brevo_smtp_key
DEFAULT_FROM_EMAIL=Accra Life Mini <verified@example.com>
```

The sender address must be verified with your email provider.

Restart Django after changing environment variables.

**Security note:** This project is configured for local development. A production deployment requires HTTPS, secure secret management, appropriate CORS and host settings, secure token handling, and additional deployment-specific safeguards.

## 💰 In-Game Economy

Players begin with an initial balance of **GH₵5,000**.

They can earn and spend money through gameplay activities.

| Activity | Financial Effect |
|---|---|
| Create character | Receive GH₵5,000 starting balance |
| Complete delivery | Earn GH₵200 |
| Purchase MiniMart item | Deduct the item's price |

Player balances are managed through the Django backend and persisted in PostgreSQL.

## 🕹️ Gameplay Controls

| Key | Action |
|---|---|
| W | Move forward |
| A | Move left |
| S | Move backward |
| D | Move right |

Additional interactions are available through the game's interface and contextual action prompts.

## 🧪 Development Status

Accra Life Mini is an actively developed prototype.

**Implemented functionality includes:**

- Account registration and login
- Password reset and account recovery
- Character creation
- Interactive 3D city exploration
- Player movement
- Player statistics and balance
- Delivery jobs and rewards
- MiniMart purchases
- Persistent backend data
- JWT authentication and logout

**Potential future improvements:**

- Non-playable characters (NPCs)
- Additional employment opportunities
- Public transportation systems
- Expanded city interactions
- Improved player progression
- Additional gameplay activities
- Production deployment and monitoring

## 🎯 Project Objectives

The project aims to:

- Demonstrate full-stack software engineering using modern web technologies.
- Explore interactive 3D game development in the browser.
- Implement authentication and persistent data storage.
- Apply REST API design principles to game services.
- Build an extensible foundation for simulation-based gameplay.
- Represent familiar elements of Ghanaian urban life in an interactive environment.

## 👨‍💻 Author

**Prosper Gyinka**

Software Engineer | Full-Stack Development | Cloud & DevOps

GitHub: [Prosper41](https://github.com/Prosper41)

## 📄 License

No license has been specified for this repository. All rights are reserved unless a license is added.

---

*Accra Life Mini — Experience a virtual slice of life in Accra, Ghana.* 🇬🇭
