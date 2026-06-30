# RoleFit AI

RoleFit AI compares a resume with a job description and provides an ATS score,
missing keywords, actionable feedback, and Groq-generated resume bullets.

## Features

- JWT email and password authentication
- PDF and DOCX resume uploads
- Resume-to-job matching and ATS scoring
- Groq analysis with a local fallback analyzer
- Keyword and bullet-point recommendations
- Saved analysis history
- Career dashboard with score analytics and premium-ready credits
- Google login with backend token verification
- Razorpay test checkout for premium analysis credits
- Dark/light theme toggle saved in localStorage
- Browser PDF report download through the print/save flow
- Responsive React interface

PDF parsing uses `pdf-parse`. Scanned or image-only PDFs still need OCR, so upload a DOCX or selectable-text PDF for best results.

## Backend Structure

```text
server/
  config/       MongoDB connection
  controllers/  Authentication, uploads, and analysis request handlers
  middleware/   JWT route protection
  models/       User, resume, and analysis database access
  routes/       Express endpoint declarations
  services/     Groq, parsing, upload, and fallback analysis logic
```

## Requirements

- Node.js 18 or newer
- MongoDB or MongoDB Atlas
- A Groq API key

## Setup

1. Create a root `.env` file from `.env.example`.
2. Add your MongoDB connection string, JWT secret, and Groq API key.
3. Install dependencies:

   ```bash
   npm install
   npm install --prefix client
   ```

4. Start the API:

   ```bash
   npm run server
   ```

5. In another terminal, start the client:

   ```bash
   npm run client
   ```

The client runs at `http://localhost:5173` and the API at
`http://localhost:5000` by default.

## Environment

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
MONGO_DB_NAME=rolefit_ai
JWT_SECRET=change_this_to_a_long_random_secret
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
FREE_ANALYSIS_CREDITS=2
PREMIUM_PRICE_INR=99
PREMIUM_ANALYSIS_CREDITS=5
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Do not commit `.env`.
