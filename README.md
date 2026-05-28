# VYOM AI

Know the risk before the money moves

Vyom AI is a real-time fraud intelligence and scam detection platform built to help people understand suspicious financial activity before damage happens.

The goal behind the project was simple:

Most fraud tools either overwhelm people with technical jargon or only react after something bad already happened.

Vyom tries to make fraud analysis feel understandable, calm, and actionable.

Instead of throwing raw alerts everywhere, the platform focuses on:

* real-time transaction monitoring
* scam signal analysis
* behavioral risk detection
* simple human-readable explanations
* operational visibility through a modern dashboard

The project started as a hackathon build, but the focus quickly shifted toward making it feel like a real production-ready product instead of a demo UI.

---

# Live Project

### Live Demo

[Vyom AI Live Platform](https://vyom-rose.vercel.app/?utm_source=chatgpt.com)

### GitHub Repository

[Vyom AI Repository](https://github.com/javawithaaryan/Vyom?utm_source=chatgpt.com)

---

# What Vyom AI Does

### Real-Time Fraud Monitoring

Analyze transaction activity as it happens and identify suspicious patterns before money moves.

### Scam & Phishing Detection

Detect scam indicators inside:

* messages
* payment requests
* suspicious conversations
* transaction metadata

### Behavioral Intelligence

Track unusual activity patterns like:

* location mismatches
* velocity spikes
* abnormal transaction behavior
* device inconsistency

### Operational Dashboard

A centralized interface for monitoring:

* live fraud activity
* alerts
* analysis queues
* system confidence signals

---

# Tech Stack

## Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Framer Motion

## Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Socket.IO

## Security & Infrastructure

* Helmet
* CORS Protection
* Rate Limiting
* Environment Variable Isolation

---

# Project Structure

```bash id="vlpj1z"
VYOM/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── socket/
│   │   └── utils/
│   │
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── README.md
└── package.json
```

---

# Frontend Philosophy

A lot of time went into making the UI feel:

* calm
* trustworthy
* operational
* human

The design intentionally avoids:

* crypto-style neon dashboards
* overloaded animations
* noisy AI startup aesthetics
* fake futuristic visuals

The goal was to make the interface feel like something an actual fintech security team could use every day.

---

# Design System

The frontend uses:

* deep navy surfaces
* muted cyan highlights
* restrained glassmorphism
* soft motion
* subtle data visualization

The ripple system in the hero section was designed to resemble:

* network intelligence pulses
* signal propagation
* real-time fraud monitoring activity

instead of decorative abstract animation.

---

# Authentication

Vyom AI uses JWT-based authentication.

Current auth flow includes:

* registration
* login
* protected dashboard routes
* session persistence
* logout handling

---

# Environment Variables

## Client

```env id="w2q6jg"
VITE_API_URL=http://localhost:5000/api
```

## Server

```env id="c3s9uq"
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

---

# Running Locally

## 1. Clone the Repository

```bash id="2rx4oj"
git clone https://github.com/javawithaaryan/Vyom.git
```

---

## 2. Install Dependencies

### Client

```bash id="d3vl4o"
cd client
npm install
```

### Server

```bash id="m0g6qe"
cd server
npm install
```

---

## 3. Start Backend

```bash id="szf0pt"
cd server
npm run dev
```

---

## 4. Start Frontend

```bash id="mmtm3g"
cd client
npm run dev
```

---

# Available Routes

## Public

* `/`
* `/solutions`
* `/security`
* `/pricing`
* `/login`
* `/register`

## Protected

* `/dashboard`
* `/fraud-detection`
* `/scam-analyzer`

---

# Main Features

* Real-time fraud analysis
* Scam detection workflows
* Protected dashboard routing
* Modern operational UI
* Responsive design system
* WebSocket-ready infrastructure
* Modular frontend architecture
* Production-oriented backend setup

---

# Current State

The project is currently in an MVP-to-production transition phase.

Main priorities now are:

* backend intelligence improvements
* real transaction analysis pipelines
* AI model integration
* dashboard analytics
* alert workflows
* infrastructure hardening
* deployment scaling

---

# Things Learned During Development

A big part of this project was realizing how different:

* “cool looking”
  and
* “trustworthy usable product”

actually are.

A lot of the frontend was rebuilt multiple times to remove:

* excessive effects
* template-looking UI
* startup clichés
* visual clutter

The final direction became much more focused on clarity, trust, and usability.

---

# Future Plans

Planned improvements include:

* AI-powered fraud scoring
* transaction graph analysis
* anomaly clustering
* team collaboration tools
* investigation timelines
* advanced analytics
* live monitoring streams
* enterprise infrastructure

---

# Important Notes

This repository intentionally excludes:

* `.env` files
* secrets
* production credentials

Make sure to create your own local environment variables before running the project.

---

# Final Thought

Vyom AI was built with the idea that fraud intelligence tools shouldn't feel cold, confusing, or overwhelming.

People need systems that help them understand risk clearly and react early.

That idea shaped almost every decision in this project.
