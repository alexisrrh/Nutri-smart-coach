# 🥗 NutriSmart Coach

### AI-Powered Nutrition & Fitness Platform

NutriSmart Coach is a modern nutrition and fitness platform that combines Artificial Intelligence, personalized meal planning, workout tracking, and progress monitoring to help users achieve their health goals through a simple and intuitive experience.

---

## 🚀 Overview

NutriSmart Coach was built to simplify nutrition tracking and fitness planning by leveraging Artificial Intelligence and modern web technologies.

Unlike traditional nutrition apps that require extensive manual input, NutriSmart Coach focuses on automation, personalization, and user experience.

---

## ✨ Key Features

### 🤖 AI Food Analysis

Analyze meals using images and receive:

* Food identification
* Estimated calories
* Macronutrient breakdown
* Personalized recommendations

### 🥗 Smart Meal Plans

Generate personalized meal plans based on:

* Goal (Lose Fat / Gain Muscle / Maintain Weight)
* Weight
* Height
* Activity level
* Dietary preferences

### 📈 Progress Tracking

Track your journey with:

* Meal history
* Weekly check-ins
* Progress monitoring
* Goal completion tracking

### 🏋️ Workout Library

Access organized exercise routines by muscle groups:

* Chest
* Back
* Shoulders
* Legs
* Biceps
* Triceps
* Core

### 👤 User Management

* Secure authentication
* Protected routes
* Profile management
* Personalized dashboard

### 💎 Premium Features

Premium users gain access to advanced tools and enhanced tracking capabilities.

### 👥 Referral System

Invite friends and unlock rewards through the integrated referral program.

### 🌎 Multi-language Support

Internationalization support powered by i18next.

### 📱 Mobile Ready

Android support via Capacitor.

---

## 🏗️ System Architecture

```text
┌─────────────────────┐
│      Frontend       │
│ React + Vite        │
│ Tailwind CSS        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Backend        │
│ Node.js + Express   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Supabase       │
│ Auth + Database     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Gemini AI       │
│ Nutrition Analysis  │
└─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* JavaScript (ES6+)
* Tailwind CSS
* Framer Motion
* React Router DOM
* Lucide React

### Backend

* Node.js
* Express.js
* REST APIs

### Database & Authentication

* Supabase

### Artificial Intelligence

* Gemini AI

### Mobile

* Capacitor
* Android

### Analytics

* Google Analytics 4

### Internationalization

* i18next
* react-i18next

### Testing & Quality

* Vitest
* ESLint

---

## 📂 Project Structure

```bash
nutricoach/
│
├── src/
│   ├── pages/
│   ├── services/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   └── assets/
│
├── backend/
│
├── android/
│
├── supabase/
│   └── migrations/
│
├── public/
│
└── docs/
```

---

## 🔒 Security

The platform includes:

* Secure authentication with Supabase Auth
* Protected routes
* User session management
* JWT verification
* Secure API communication

---

## 📊 Main Functionalities

### Food Analysis

Upload a meal image and receive:

* Nutritional information
* Estimated calories
* Macronutrients
* AI recommendations

### Personalized Diets

Generate complete meal plans tailored to each user.

### Progress Hub

Monitor:

* Nutrition habits
* Workout consistency
* Check-in history
* Goal adherence

### Exercise Management

Access fitness resources organized by muscle groups and training objectives.

---

## 📱 Mobile Support

Android deployment is supported through Capacitor.

```bash
npm run cap:sync
npm run cap:android
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/alexisrrh/Nutri-smart-coach.git
```

Navigate to the project folder:

```bash
cd Nutri-smart-coach
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## 🔧 Environment Variables

Create a `.env.local` file and configure:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=your_backend_url
VITE_GA_ID=your_google_analytics_id
```

---

## 🧪 Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test

npm run cap:sync
npm run cap:android
```

---

## 🛣️ Roadmap

### Completed

* [x] Authentication System
* [x] Protected Routes
* [x] AI Food Analysis
* [x] Personalized Meal Plans
* [x] Meal Tracking
* [x] Progress Tracking
* [x] Workout Library
* [x] Referral System
* [x] Premium Features
* [x] Android Support

### Future Improvements

* [ ] Smart Shopping Lists
* [ ] Advanced Progress Analytics
* [ ] Apple App Support
* [ ] Community Features
* [ ] AI Body Fat Estimation
* [ ] Wearable Device Integration

---

## 🎯 Project Goal

The mission of NutriSmart Coach is to make nutrition and fitness management easier, smarter, and more accessible through Artificial Intelligence and an exceptional user experience.

---

## 👨‍💻 Author

### Alexis Rodríguez

Frontend Developer

GitHub:
https://github.com/alexisrrh

LinkedIn:
https://www.linkedin.com/in/alexisrrh

---

⭐ If you like this project, consider giving it a star on GitHub.
