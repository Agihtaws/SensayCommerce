# SensayCommerce: AI-Powered E-commerce Platform

## 🚀 Live Demo & Project Links

| Resource                  | Link                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Live Frontend Application | [https://sensaycommerce.onrender.com/](https://sensaycommerce.onrender.com/)                     |
| Backend API Base URL      | [https://sensay-backend.onrender.com/api/health](https://sensay-backend.onrender.com/api/health) |
| GitHub Repository         | [https://github.com/Agihtaws/SensayCommerce](https://github.com/Agihtaws/SensayCommerce)         |
| Demo Video                | [https://youtu.be/yVAbpy0n6Ac](https://youtu.be/yVAbpy0n6Ac)                                                                          |

---

## ✨ Introduction

**SensayCommerce** is an innovative e-commerce platform that combines **intelligent AI assistance** with a modern shopping experience. Built as a **monorepo** with separate frontend and backend applications, it provides:

* **Smart AI support for customers**
* **Dynamic product knowledge management**
* **Efficient operations for administrators**

The core innovation is the **Sensay AI Assistant**, which enhances user experience by answering questions, providing recommendations, and guiding customers, embodying the principle:

> “Sell smarter. Scale faster.”

---

## 💡 Project Idea & Core Value

SensayCommerce addresses the limitations of traditional e-commerce platforms by offering:

* **Empowered Customers:** Instant, contextualized AI support and product guidance.
* **Boosted Sales & Conversions:** Personalized recommendations and shopping assistance.
* **Streamlined Operations:** Automation of routine queries, freeing human staff for strategic tasks.

This platform demonstrates how AI can transform digital retail by making shopping more engaging and efficient.

---

## 🤖 Sensay E-commerce Assistant (Chatbot)

### Overview

The **Sensay E-commerce Assistant** is an AI chatbot designed to:

* Guide customers through the shopping process.
* Answer product and policy-related questions.
* Provide a 24/7 virtual sales and support experience.

It addresses the **Sensay Connect Hackathon** challenge: *“E-Commerce – Sell smarter. Scale faster.”*

---

### Core Functionality

1. **Customer Interaction & Contextual Understanding**

   * Users interact through a floating chat widget (text & voice via Web Speech API).
   * Backend retrieves user context (profile, cart, recent orders) to enhance AI responses.
   * Common queries (e.g., “Track my order”) are handled locally for faster responses.

2. **Dynamic Knowledge Base Integration**

   * Product catalog synced dynamically with the Sensay AI knowledge base.
   * Admins can enrich the knowledge base with PDFs, CSVs, or TXT files (e.g., manuals, policies, FAQs).

3. **Sensay AI Processing**

   * `SensayService` forwards queries with context to the Sensay AI replica.
   * AI provides natural, actionable responses including product links.
   * All interactions tracked against Sensay balance.

---

### Use Case: Enhanced Customer Experience

* **24/7 Intelligent Support:** Immediate answers, improved satisfaction.
* **Personalized Sales Assistance:** Product recommendations and upsell suggestions.
* **Efficient Information Access:** Quick, conversational access to product details.
* **Operational Efficiency:** Reduces workload on human support teams.
* **Scalability:** Handles large volumes of interactions without extra staffing.

---

## 🛠️ Technology Stack

| Layer           | Technologies                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Frontend        | React.js, React Router DOM, Axios, Lucide React, React Hot Toast                                  |
| Backend         | Node.js, Express.js, Mongoose, JWT, Dotenv, Cors, Helmet, Express Rate Limit, Multer & Cloudinary |
| Database        | MongoDB Atlas                                                                                     |
| AI Platform     | Sensay AI                                                                                         |
| Deployment      | Render (Frontend & Backend)                                                                       |
| Version Control | Git, GitHub                                                                                       |

---

## ⚙️ Local Development Setup

### Prerequisites

* Node.js (v18+)
* npm or yarn
* MongoDB Atlas account
* Sensay API credentials
* Cloudinary account

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Agihtaws/SensayCommerce.git
cd SensayCommerce
```

---

### 2️⃣ Backend Setup (`sensay-ecommerce-backend`)

```bash
cd sensay-ecommerce-backend
```

#### A. Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=YOUR_MONGO_URI
JWT_SECRET=YOUR_SECRET_KEY
SENSAY_ORGANIZATION_SECRET=
SENSAY_ORGANIZATION_ID=
SENSAY_BASE_URL=https://api.sensay.io
SENSAY_API_VERSION=2025-03-25
SENSAY_SYSTEM_USER_ID=
SENSAY_REPLICA_NAME=
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN_FRONTEND=http://localhost:3000
```

#### B. Install Dependencies

```bash
npm install
```

#### C. Seed Admin User (First-Time Only)

```bash
npm run seed-admin
```

* Admin Email: `admin@sensay-ecommerce.com`
* Password: `Admin123!`
* Initial Sensay Balance: 5000 units

#### D. Run Backend

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup (`sensay-ecommerce-frontend`)

```bash
cd ../sensay-ecommerce-frontend
```

#### A. Environment Variables (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Sensay E-commerce
```

#### B. Install Dependencies

```bash
npm install
```

#### C. Run Frontend

```bash
npm start
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment (Render)

* Frontend: Static Site
* Backend: Web Service
* Continuous deployment from GitHub

**Environment Variables** must be set on Render according to local `.env` settings, with `NODE_ENV=production`.

---


## 📈 Future Enhancements

* Advanced AI: Multi-turn conversations, proactive suggestions, personalized upsells.
* Payment Gateway Integration: Stripe, PayPal, etc.
* User Reviews & Ratings
* Admin Analytics Dashboard
* Real-time Notifications
* Dark Mode

---

## 🧑‍💻 Author

**Swathiga Ganesh** – Creator & Developer

* GitHub: [https://github.com/Agihtaws](https://github.com/Agihtaws)
* Email: [swathiga581@gmail.com](mailto:swathiga581@gmail.com)

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.


