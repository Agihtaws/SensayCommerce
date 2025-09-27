# SensayCommerce: AI-Powered E-commerce Platform

## 🚀 Live Demo & Project Links

*   **Live Frontend Application:** [https://sensaycommerce.onrender.com/](https://sensaycommerce.onrender.com/)
*   **Backend API Base URL:** [https://sensay-backend.onrender.com/api/health](https://sensay-backend.onrender.com/api/health)
*   **GitHub Repository:** [https://github.com/Agihtaws/SensayCommerce](https://github.com/Agihtaws/SensayCommerce)
*   **Demo Video:** [YOUR_DEMO_VIDEO_LINK] (e.g., YouTube, Loom)

---

## ✨ Introduction

**SensayCommerce** is an innovative e-commerce platform designed to revolutionize online shopping through deep integration with **Sensay's powerful AI agent platform**. Built as a monorepo with distinct frontend and backend applications, it offers a seamless and intelligent shopping experience for customers and a robust management interface for administrators.

The core innovation lies in the **Sensay AI Assistant**, which leverages advanced conversational AI to guide customers, answer product questions, track intent, and provide personalized support, embodying the vision of "selling smarter and scaling faster" in e-commerce.

---

## 💡 Project Idea & Core Value

Our project addresses the need for more intelligent and responsive e-commerce experiences. Traditional online stores often lack the personalized, real-time assistance that a human sales associate provides. SensayCommerce bridges this gap by:

*   **Empowering Customers:** Offering instant, contextualized support and product information through a smart AI chatbot.
*   **Boosting Sales & Conversions:** Guiding customers effectively, suggesting relevant products, and assisting with the purchasing process, even when human staff are unavailable.
*   **Streamlining Operations:** Automating routine customer inquiries and product information delivery, allowing human teams to focus on complex issues and strategic growth.

This platform serves as a testament to how AI can transform the digital retail landscape, making shopping more engaging and efficient for everyone.

---

## 🤖 How the Chatbot Works & Its Use Case (Sensay Connect Hackathon Submission)

### Chatbot Overview: Sensay E-commerce Assistant

The "Sensay E-commerce Assistant" is a custom-built AI chatbot integrated into the Swathiga E-commerce Solutions platform. Its primary function is to enhance the customer experience by providing intelligent, real-time support, product information, and personalized guidance throughout the shopping journey. It acts as a 24/7 virtual sales and support agent, directly addressing the "E-Commerce – Sell smarter. Scale faster." track of the Sensay Connect Hackathon.


### Core Functionality & AI Integration:

1.  **Customer Interaction & Contextual Understanding:**
    *   Customers interact with the chatbot via a floating widget on the public frontend, using text or voice input (via Web Speech API).
    *   For logged-in users, the backend dynamically gathers crucial real-time context: user profile (name, email), current items in their shopping cart, and details of recent orders.
    *   This rich context is passed with the customer's query to the Sensay AI, enabling highly personalized and relevant responses (e.g., "You have a gaming mouse in your cart, would you like to see compatible gaming keyboards?").
    *   **Local Context Handling:** The system intelligently intercepts common queries like "what's in my cart?" or "track my order [Order ID]" to provide immediate, precise responses directly from the e-commerce database, optimizing speed and efficiency before engaging the broader AI.

2.  **Dynamic Knowledge Base Integration:**
    *   The platform's entire product catalog (including names, descriptions, prices, brands, categories, specifications, and images) is automatically and dynamically synchronized with the Sensay AI's knowledge base upon product creation or update.
    *   Administrators can further enrich the knowledge base by uploading external files (PDF, TXT, CSV) directly through the admin panel, providing the chatbot with comprehensive data on company policies, detailed product manuals, or FAQs.
    *   The Sensay AI leverages this up-to-date knowledge to accurately answer customer queries about products, policies, and more.

3.  **Sensay AI Processing & Intelligent Responses:**
    *   The backend's dedicated `SensayService` acts as the bridge, forwarding customer queries (with their rich context) to the `E-commerce Assistant` replica on the Sensay platform.
    *   Sensay's powerful AI agents process this information, understand intent, and generate natural language responses. These responses are designed to be informative, helpful, and often include actionable links back to relevant product pages or sections of the e-commerce site.
    *   All AI interactions (chat completions, knowledge updates, replica creation) are meticulously tracked and deducted from the user's (or system's) Sensay balance, ensuring transparent resource management.

### Use Case: Enhanced E-commerce Customer Experience

The primary use case is to **transform and elevate the customer experience** for the Swathiga E-commerce Solutions platform, aligning perfectly with the "E-Commerce – Sell smarter. Scale faster." track.

*   **24/7 Intelligent Support:** Customers receive immediate, accurate answers to product inquiries, order status checks, and general questions, significantly reducing response times and improving satisfaction.
*   **Personalized Sales Assistance:** The AI acts as a virtual sales assistant, offering tailored product recommendations, suggesting complementary items, and proactively guiding customers through their purchasing decisions, thereby increasing conversion rates and average order value.
*   **Efficient Information Access:** Eliminates the need for customers to navigate extensive FAQs or product manuals, allowing them to get information quickly and effortlessly through natural conversation.
*   **Operational Efficiency:** Automates a large volume of routine customer interactions, allowing human support teams to focus on more complex, high-value tasks.
*   **Scalability:** Provides a scalable customer engagement solution that can handle fluctuating demand without proportional increases in staffing.

In conclusion, the Sensay E-commerce Assistant is a sophisticated, context-aware AI solution that brings intelligent, conversational commerce to life, directly addressing the hackathon's challenge by enabling smarter selling and faster growth.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, React Router DOM, Axios, Lucide React (icons), React Hot Toast (notifications)
*   **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM), Dotenv, Cors, Helmet, Express Rate Limit, JSON Web Token (JWT), Cloudinary (image storage), Multer, Multer-Storage-Cloudinary
*   **Database:** MongoDB Atlas (Cloud-hosted NoSQL)
*   **AI Platform:** Sensay AI (for chatbot and knowledge base)
*   **Deployment:** Render (Frontend & Backend Serverless Functions)
*   **Version Control:** Git, GitHub

---


## ⚙️ Local Development Setup

Follow these instructions to set up and run the **SensayCommerce** application on your local machine.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   MongoDB Atlas Account (for a cloud-hosted database URI)
*   Sensay API Keys (Organization Secret, Organization ID, System User ID, Replica Name)
*   Cloudinary Account (Cloud Name, API Key, API Secret)

### 1. Clone the Repository

```bash
git clone https://github.com/Agihtaws/SensayCommerce.git
cd SensayCommerce

2. Backend Setup (sensay-ecommerce-backend)
Navigate to the backend directory:
cd sensay-ecommerce-backend

A. Environment Variables (.env)
Create a .env file in the sensay-ecommerce-backend/ directory with the following content. Replace placeholder values with your actual credentials.
# Backend .env for Local Development
PORT=5000
MONGODB_URI=
JWT_SECRET= your-super-secure-jwt-secret-key-here
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
CORS_ORIGIN_FRONTEND=http://localhost:3000 # For local frontend


MONGODB_URI: Get this from your MongoDB Atlas dashboard.
JWT_SECRET: Use a strong, random string.
Sensay & Cloudinary Keys: Your actual API credentials.

B. Install Dependencies
npm install # or yarn install

C. Seed Admin User (Optional, First Time Only)
To create an initial admin user and set up their Sensay balance for testing the admin panel:
npm run seed-admin


Admin Credentials for Local Login:

Email: admin@sensay-ecommerce.com
Password: Admin123!
Initial Sensay Balance: 5000 units



D. Run the Backend
npm run dev

You should see output indicating successful MongoDB connection and the server running on http://localhost:5000. Keep this terminal running.
3. Frontend Setup (sensay-ecommerce-frontend)
Open a new terminal window and navigate to the frontend directory (from the project root):
cd sensay-ecommerce-frontend

A. Environment Variables (.env)
Create a .env file in the sensay-ecommerce-frontend/ directory:
# Frontend .env for Local Development
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Sensay E-commerce


This tells your frontend to connect to your locally running backend.

B. Install Dependencies
npm install # or yarn install

C. Run the Frontend
npm start

This will open your React app in your browser, usually at http://localhost:3000.

☁️ Deployment
This project is deployed using Render for both the frontend and backend applications, leveraging their continuous deployment from GitHub.

Frontend Deployment: The React application is deployed as a Static Site on Render.
Backend Deployment: The Node.js/Express.js application is deployed as a Web Service on Render.

The vercel.json file in the repository root is intended for Vercel deployment, showcasing a production-ready configuration for that platform, including serverless functions for the backend.
Render Environment Variables
When deploying to Render, the following environment variables were configured:
For sensay-ecommerce-backend (Render Web Service):

MONGODB_URI: 
JWT_SECRET: your-super-secure-jwt-secret-key-here
SENSAY_ORGANIZATION_SECRET: 
SENSAY_ORGANIZATION_ID: 
SENSAY_BASE_URL: https://api.sensay.io
SENSAY_API_VERSION: 2025-03-25
SENSAY_SYSTEM_USER_ID: 
SENSAY_REPLICA_NAME: 
CLOUDINARY_CLOUD_NAME: 
CLOUDINARY_API_KEY: 
CLOUDINARY_API_SECRET: 
NODE_ENV: production
CORS_ORIGIN_FRONTEND: https://sensaycommerce.onrender.com

For sensay-ecommerce-frontend (Render Static Site):

REACT_APP_API_URL: https://sensay-backend.onrender.com/api
REACT_APP_APP_NAME: Sensay E-commerce


🖼️ Screenshots & Media
[YOUR_LOGO_IMAGE_URL]
(e.g., a nice logo or a key screenshot of your application)

📈 Future Enhancements

Advanced AI Features: Implement more complex Sensay AI integrations like proactive suggestions, multi-turn conversations for complex product comparisons, or personalized upsell flows based on browsing history.
Payment Gateway Integration: Integrate real payment processing (e.g., Stripe, PayPal) instead of simulated payment.
User Reviews & Ratings: Allow customers to leave reviews and ratings for products.
Admin Analytics Dashboards: Develop more interactive and detailed analytics reports for administrators.
Notifications: Implement real-time notifications for order status updates, new messages, etc.
Dark Mode: Add a dark mode toggle for improved user experience.


🧑‍💻 Author
Swathiga Ganesh - Creator, Developer

GitHub: https://github.com/Agihtaws
Email: swathiga581@gmail.com


📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

