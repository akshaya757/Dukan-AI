# Dukan AI — Voice-Based Inventory Management for Small Businesses

> **"Manage Your Stock With Your Voice."**

Dukan AI is a voice-first inventory management system built for small businesses in India.
Shop owners can speak in **Telugu**, **English**, or **mixed Telugu-English** to manage their inventory — no typing, no complex forms.

---

## 🎯 Problem Statement

Small shop owners in India manage inventory with notebooks, WhatsApp, or memory. Existing inventory systems require English typing and technical knowledge. Dukan AI removes this barrier.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Voice commands (Telugu + English) | ✅ |
| Stock IN / Stock OUT | ✅ |
| Product CRUD | ✅ |
| Low Stock Alerts | ✅ |
| Transaction History | ✅ |
| Real-time MySQL updates | ✅ |
| Text-to-Speech responses | ✅ |
| Mobile-first responsive UI | ✅ |
| Gemini AI NLP (optional) | ✅ |
| Rule-based Telugu parser (fallback) | ✅ |

---

## 🏗️ Architecture

```
User
 ↓ 🎤 Speaks (Telugu/English/Mixed)
Web Speech API (Browser)
 ↓ Text
React Frontend (Vite)
 ↓ POST /api/voice/parse
Spring Boot Backend
 ↓
HybridNlpProcessor
 ├── GeminiNlpClient (if API key)
 └── RuleBasedParser (fallback)
 ↓
VoiceService → InventoryService
 ↓ @Transactional
MySQL (via Flyway migrations)
 ↓
Response → TTS (browser)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, CSS |
| Backend | Java 17, Spring Boot 3.2 |
| Database | MySQL 8+ |
| ORM | Spring Data JPA, Hibernate |
| Migrations | Flyway |
| NLP | Gemini API + Rule-based parser |
| Speech | Web Speech API (browser) |

---

## 🗄️ Database Schema

```
users (id, name, email, phone, shop_name, preferred_language, ...)
  │
  └── products (id, user_id, name, category, unit, current_stock, minimum_stock, price, ...)
        │
        └── inventory_transactions (id, product_id, quantity, operation, source, previous_stock, new_stock, ...)
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+

### 1. Clone & Configure

```bash
git clone <repo-url>
cd "DUKAN AI"
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 2. Create MySQL Database

```sql
CREATE DATABASE dukanai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Start Backend

```bash
cd backend

# Set environment variables (Windows PowerShell)
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_NAME="dukanai"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
$env:GEMINI_API_KEY="your_key_optional"

mvn spring-boot:run
```

Flyway will automatically create all tables and insert sample data.

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🔌 API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inventory/add` | Add stock |
| POST | `/api/inventory/remove` | Remove stock |
| GET | `/api/inventory/low-stock` | Low stock products |
| GET | `/api/inventory/transactions` | Transaction history |
| GET | `/api/inventory/dashboard` | Dashboard stats |

### Voice
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/parse` | Parse command (no execute) |
| POST | `/api/voice/execute` | Parse + execute command |

---

## 🎤 Voice Command Examples

| Command | Intent | Action |
|---------|--------|--------|
| "Rice 5 bags add cheyyi" | ADD_STOCK | Adds 5 bags to Rice |
| "Rice 10 bags vachayi" | ADD_STOCK | Adds 10 bags to Rice |
| "Sugar 2 kg ammamu" | REMOVE_STOCK | Removes 2 kg from Sugar |
| "Rice entha undi?" | CHECK_STOCK | Reports Rice stock |
| "Which products are low?" | LOW_STOCK | Lists low-stock products |
| "Oil 2.5 litres add cheyyi" | ADD_STOCK | Adds 2.5 litres of Oil |

---

## 🎬 Hackathon Demo Flow

**Initial state**: Rice = 20 Bags

1. 🎤 Say: "Rice 10 bags vachayi"
   - Confirmation shown: ADD 10 bags of Rice
   - Confirm → Rice: 20 → 30 bags
   - TTS: "Rice stock is now 30.00 bags."

2. 🎤 Say: "Rice 5 bags ammamu"
   - Rice: 30 → 25 bags

3. 🎤 Say: "Rice entha undi?"
   - TTS: "Rice stock is 25.00 bags."

4. 🎤 Say: "Which products are low?"
   - Shows Sugar (3 kg) and Oil (2 litres) from **real MySQL data**

---

## 🔒 Security

- No credentials in source code — environment variables only
- `.env` is in `.gitignore`
- JPA parameterized queries (SQL injection prevention)
- Input validation on all API endpoints
- CORS restricted to localhost origins

---

## 🔮 Future Scope

- More Indian languages (Hindi, Kannada, Tamil, Malayalam)
- WhatsApp integration for voice commands
- Supplier management
- Automatic reorder suggestions
- Sales forecasting
- Voice-based billing & invoice generation
- Multi-shop management
- Cloud deployment (GCP / AWS)
- Offline voice processing
- Mobile app (React Native)

---

## 📁 Project Structure

```
DUKAN AI/
├── frontend/              ← React + Vite
│   ├── src/
│   │   ├── pages/         ← 8 pages
│   │   ├── components/    ← Reusable components
│   │   ├── services/      ← Axios API client
│   │   ├── hooks/         ← Voice recognition + TTS
│   │   └── context/       ← App state
│   └── index.html
├── backend/               ← Spring Boot
│   └── src/main/java/com/dukanai/
│       ├── controller/    ← REST endpoints (thin)
│       ├── service/       ← Business logic
│       ├── repository/    ← JPA repositories
│       ├── entity/        ← JPA entities
│       ├── dto/           ← Request/Response DTOs
│       ├── voice/         ← NLP processing layer
│       ├── exception/     ← Global error handling
│       └── config/        ← CORS, etc.
├── .env.example
└── README.md
```

---

*Built for a Hackathon — Dukan AI © 2025*
