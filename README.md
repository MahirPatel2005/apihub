# APIHub - The Ultimate API Ecosystem

APIHub is a sophisticated, full-stack platform engineered for the modern developer. It serves as a unified hub to **Discover**, **Share**, and **Monetize** APIs. Built with a focus on visual excellence and technical robustness, APIHub bridges the gap between API providers and consumers.

## 🌟 Project Vision & Overview

In an era where software is built on the shoulders of APIs, APIHub provides a premium environment for developers to:
- **Centralize Discovery:** Stop searching through fragmented documentation; find everything from REST to GraphQL in one place.
- **Showcase Innovation:** Provide a stage for developers to list their APIs, complete with rich metadata, tags, and category alignment.
- **Build Community:** Engage in real-time discussions, leave transparent reviews, and follow the growth of their favorite tools.
- **Enterprise-Ready Management:** Comprehensive admin tools ensure the platform remains clean, secure, and moderated.

---

## 💻 Technical Excellence

### Core Architecture
- **Micro-focused Frontend:** React 19 leveraging Hooks for state management and Framer Motion for a fluid, premium user experience.
- **Scalable Backend:** Express 5 (latest) providing a high-performance RESTful API layer.
- **Data Integrity:** MongoDB with Mongoose ensuring strictly typed schemas and efficient indexing.
- **Real-time Engine:** Socket.io enabling instant community interaction without page refreshes.

---

## 📡 API Documentation (Backend Routes)

The backend is organized into modular route handlers. All routes are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | No |
| POST | `/login` | Authenticate user and return JWT | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile details | Yes |
| GET | `/bookmarks` | Retrieve user's saved APIs | Yes |
| PUT | `/bookmarks/:id` | Toggle bookmark for an API | Yes |
| PUT | `/verifyemail/:token` | Verify email address | No |
| POST | `/forgotpassword` | Request password reset link | No |
| PUT | `/resetpassword/:token` | Set a new password | No |

### 🛠️ API Management (`/api/apis`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Fetch all approved APIs (with search/filters) | No |
| GET | `/:id` | Get detailed information for a specific API | No |
| POST | `/` | Submit a new API for review | Yes |
| PUT | `/:id` | Update an existing API listing | Yes (Owner) |
| DELETE | `/:id` | Remove an API listing | Yes (Owner/Admin) |
| GET | `/my/apis` | Fetch APIs owned by the user | Yes |
| POST | `/track-impressions` | Log view counts for an API | No |

### 💬 Community & Social (`/api/communities` & `/api/apis/:id/reviews`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/communities` | List all available chat communities | No |
| POST | `/communities` | Create a new community room | Yes |
| PUT | `/communities/:id/join` | Join a community room | Yes |
| GET | `/communities/:id/messages` | Get chat history for a room | Yes |
| POST | `/apis/:id/reviews` | Post a review/rating for an API | Yes |
| GET | `/apis/:id/reviews` | Get all reviews for an API | No |

### 💳 Payments & Sponsorship (`/api/payment`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/create-checkout-session` | Initialize Stripe payment | Yes |
| GET | `/verify-session` | Confirm payment success | Yes |

### 🛡️ Administration (`/api/admin`)
*All routes here require Admin privileges.*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/pending` | View APIs awaiting approval |
| PUT | `/apis/:id/status` | Approve or reject a submission |
| PUT | `/apis/:id/attributes` | Feature, verify, or deprecate an API |
| GET | `/users` | Manage registered users |
| PUT | `/users/:id/status` | Ban or promote users |
| GET | `/logs` | Review system audit logs |
| GET | `/reviews` | Moderate all platform reviews |
| GET | `/settings` | Global system configuration |
| GET | `/analytics/bookmarks` | View trending/most saved APIs |

---

## 📂 Advanced Project Structure

```text
apihub/
├── client/ (Frontend)
│   ├── public/             # Static assets (favicons, manifest)
│   ├── src/
│   │   ├── components/     # UI: Navbar, Footer, Buttons, Cards
│   │   ├── context/        # AuthContext for global user state
│   │   ├── lib/            # Axios instance with BaseURL awareness
│   │   ├── pages/          # Full-page views (Dashboard, Login, etc.)
│   │   ├── App.jsx         # Routing configuration
│   │   └── main.jsx        # Entry point & Providers
├── server/ (Backend)
│   ├── controllers/        # Logic: authController, apiController, etc.
│   ├── middleware/         # Security: protect, admin, rateLimit
│   ├── models/             # Schema Definitions: User.js, Api.js, Message.js
│   ├── routes/             # Endpoint definitions grouped by resource
│   ├── utils/              # Services: backup, mailer, socket handler
│   └── index.js            # Express server initialization & CORS config
└── README.md
```

---

## 🚀 Getting Started

1. **Install Dependencies:** `npm install` in both `client/` and `server/` folders.
2. **Environment Variables:** Define `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in `server/.env`.
3. **Database Seeding:** Run `node server/seed.js` to populate with sample data.
4. **Launch:** Run `npm run dev` in both directories.

---

## 🗺️ Roadmap
- [ ] Swagger/OpenAPI integration for automated documentation.
- [ ] Advanced GraphQL proxy layer.
- [ ] Native mobile application (React Native).

---

## 📜 License
ISC License
