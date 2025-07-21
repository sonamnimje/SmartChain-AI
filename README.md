# 🤖 SmartChain AI – AI-Powered Retail Supply Chain Optimization

SmartChain AI is a web-based platform that leverages advanced AI to optimize retail supply chains. It empowers businesses to improve inventory management, demand forecasting, and delivery tracking, all through a modern dashboard and a local Omnidimension-powered chatbot for actionable insights.

## 🧩 Problem Statement

Retailers face challenges with overstocking, stockouts, and inefficient deliveries, leading to lost revenue and increased waste. Traditional supply chain management tools often lack real-time intelligence and adaptability.  
**SmartChain AI** bridges this gap by providing AI-driven analytics, real-time tracking, and smart suggestions—helping businesses make data-driven decisions and streamline their operations.

---

## 🚀 Features

### 👤 User Authentication
- Secure signup/login with JWT-based authentication
- Role-based access (admin, manager, executive, etc.)

### 🏠 Dashboard
- Real-time KPIs and analytics
- Quick actions and AI-powered suggestions
- Custom menus based on user roles

### 📦 Inventory & Orders
- Smart inventory management
- Demand forecasting and reorder suggestions
- Order and delivery tracking

### 🚚 Delivery & Shipments
- Real-time delivery status
- Proof of delivery uploads
- Route optimization

### 📊 Reporting & Insights
- Comprehensive reports and visualizations
- AI-driven insights and anomaly detection

### 🤖 AI Chatbot: SmartChain AI
- Local Omnidimension-powered chatbot for supply chain Q&A
- Advanced conversational capabilities for supply chain and business queries
- No cloud API key required; privacy-first, runs locally by default

### 🛡️ Admin Panel
- User and role management
- System configuration and security settings

---

## 🎨 Color Palette
- **Eco Green** (#4CAF50) – Primary color
- **Soft Blue** (#5BC0EB) – Accent color
- **Neutral Base** (#F5F5F5) – Backgrounds
- **Charcoal/Dark Gray** (#333333) – Text and icons

---

## 🚀 Tech Stack

### Frontend
- **React** (JavaScript)
- **Material-UI** for UI components
- **Chart.js** for data visualization
- **Leaflet** for maps
- **Framer Motion** for animations

### Backend
- **FastAPI** (Python) for API
- **SQLAlchemy** for ORM
- **SQLite** for database (default and preferred)
- **JWT** for authentication
- **Pydantic** for data validation

### AI/ML
- **Omnidimension** (local) for chatbot (default)
- **Llama 2** (optional/local fallback)
- **scikit-learn**, **xgboost**, **tensorflow**, **torch** for ML

### Deployment
- Local setup (default, privacy-first)
- Easily adaptable for cloud or on-premise deployment

---

## 📁 Project Structure

```
SmartChain AI/
├── frontend/          # React frontend application
├── backend/           # FastAPI backend server
└── README.md          # This file
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- SQLite (bundled with Python)

### 2. Clone the repo

```bash
git clone https://github.com/sonamnimje/smartchain-ai.git
cd smartchain-ai
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌱 Environmental & Business Impact

SmartChain AI helps businesses:
- **Reduce waste** by optimizing inventory and deliveries
- **Increase efficiency** with AI-driven insights
- **Promote sustainable supply chains** through data-driven decisions
- **Build resilience** with real-time analytics and forecasting

# 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

🌍 Let’s Make Supply Chains Smarter.  
SmartChain AI is committed to transforming retail operations for a more efficient, sustainable, and intelligent future.

---

*Built with ❤️ for a smarter, greener tomorrow* 