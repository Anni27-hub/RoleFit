# RoleFit AI

AI-powered Resume Analyzer, ATS Optimizer, Cover Letter Generator, and Interview Preparation Platform built using the MERN Stack.

---

# Overview

RoleFit AI is a full-stack MERN application that helps job seekers improve their resumes, analyze ATS compatibility, generate tailored cover letters, prepare for interviews, and track job applications using AI.

The platform leverages Groq's Llama 3.3 model to provide intelligent resume analysis and personalized career guidance.

---

# Features

## Resume Analysis

- Upload Resume (PDF/DOCX)
- Resume Text Extraction
- ATS Compatibility Score
- Resume Strength Analysis
- Missing Keywords Detection
- Skills Gap Analysis
- Resume Improvement Suggestions
- AI Resume Feedback

---

## AI Resume Enhancement

- Generate Strong Resume Bullet Points
- Improve Existing Resume Content
- ATS Keyword Optimization
- Resume Rewrite Suggestions
- Personalized Resume Recommendations

Powered by Groq Llama 3.3.

---

## Cover Letter Generator

Generate professional cover letters using:

- Resume
- Job Description
- Target Company
- Target Role

---

## Interview Preparation

Generate:

- Technical Interview Questions
- HR Interview Questions
- Behavioral Questions
- Role-specific Questions
- Sample Answers
- Interview Tips

---

## Skill Roadmap Generator

Generate personalized learning roadmaps including:

- Missing Skills
- Recommended Technologies
- Learning Order
- Preparation Timeline

---

## Job Tracker

Track job applications with:

- Applied Jobs
- Interview Scheduled
- Rejected
- Offers
- Notes
- Application History

---

## Authentication

- JWT Authentication
- Secure Password Hashing (bcryptjs)
- Google OAuth Login
- Protected Routes
- Persistent Login Sessions

---

## Premium Features

Integrated with Razorpay.

Premium users receive:

- Additional Resume Analyses
- Unlimited AI Generations
- Premium Resume Suggestions
- Advanced ATS Reports

---

## Responsive Design

- Desktop
- Tablet
- Mobile

---

# Tech Stack

## Frontend

- React
- Vite
- React Router DOM
- Axios
- CSS3

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- pdf-parse
- mammoth
- Groq API
- Razorpay
- Google OAuth

## AI

- Groq API
- Llama 3.3 70B Versatile

---

# Project Structure

```text
RoleFit-AI/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   └── index.js
│
├── .env.example
├── package.json
├── README.md
└── .gitignore
```

---

# Requirements

- Node.js 18 or above
- npm
- MongoDB Atlas or Local MongoDB
- Groq API Key
- Google OAuth Credentials
- Razorpay Test Keys

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/Anni27-hub/RoleFit-AI.git

cd RoleFit-AI
```

---

## Install Dependencies

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
npm install --prefix client
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

CLIENT_ORIGIN=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

MONGO_DB_NAME=rolefit_ai

JWT_SECRET=your_super_secret_key

GROQ_API_KEY=your_groq_api_key

GROQ_MODEL=llama-3.3-70b-versatile

FREE_ANALYSIS_CREDITS=2

PREMIUM_PRICE_INR=99

PREMIUM_ANALYSIS_CREDITS=5

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

RAZORPAY_KEY_ID=your_razorpay_key_id

RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

# Running the Project

## Start the Backend

```bash
npm run server
```

Backend runs on:

```
http://localhost:5000
```

---

## Start the Frontend

```bash
npm run client
```

Frontend runs on:

```
http://localhost:5173
```

---

# Deployment

## Backend (Render)

### Build Command

```bash
npm install
```

### Start Command

```bash
npm run server
```

### Environment Variables

```
CLIENT_ORIGIN
MONGO_URI
MONGO_DB_NAME
JWT_SECRET
GROQ_API_KEY
GROQ_MODEL
FREE_ANALYSIS_CREDITS
PREMIUM_PRICE_INR
PREMIUM_ANALYSIS_CREDITS
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

---

## Frontend (Vercel)

### Root Directory

```
client
```

### Framework Preset

```
Vite
```

### Build Command

```bash
npm run build
```

### Output Directory

```
dist
```

### Environment Variables

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api

VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

# Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Backend Port |
| CLIENT_ORIGIN | Frontend URL |
| MONGO_URI | MongoDB Connection String |
| MONGO_DB_NAME | Database Name |
| JWT_SECRET | JWT Secret |
| GROQ_API_KEY | Groq API Key |
| GROQ_MODEL | AI Model |
| GOOGLE_CLIENT_ID | Google OAuth Client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth Client Secret |
| RAZORPAY_KEY_ID | Razorpay Key |
| RAZORPAY_KEY_SECRET | Razorpay Secret |

---

# APIs Used

- Groq API
- Google OAuth API
- Razorpay Payment Gateway

---

# Security

- JWT Authentication
- Password Hashing using bcryptjs
- Protected API Routes
- Secure Environment Variables
- Google Token Verification

---

# Future Improvements

- Resume Templates
- AI Mock Interviews
- LinkedIn Resume Import
- Resume Version Management
- Email Notifications
- Company-wise ATS Analysis
- Resume Score History
- Admin Dashboard
- AI Career Guidance
- Multi-language Support

---


# Contributing

Contributions are welcome.

1. Fork the repository.

2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# Notes

- Do not commit the `.env` file.
- Keep API keys private.
- Share only `.env.example`.
- Text-based PDFs provide the best extraction results.
- DOCX files are fully supported.
- If the Groq API is unavailable, the application can fall back to a basic local analyzer for limited functionality.

---

# Author

Anish Agarwal