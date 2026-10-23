# InterviewBlueprint

InterviewBlueprint is a MERN application for preparing for job interviews. Create an account, provide a target job description and either a PDF resume or a short self-description, and get a personalized interview plan with practice questions, skill gaps, and a seven-day preparation schedule.

## Features

- Account registration, login, and logout with an HTTP-only authentication cookie.
- PDF resume upload and text extraction (PDF files up to 3 MB).
- Gemini-powered interview reports with a match score, technical and behavioral questions, skill gaps, and a preparation plan.
- Interview reports saved to MongoDB and available in your recent plans.
- Tailored resume PDF generation.
- Responsive React interface.

## Technology

- **Frontend:** React, Vite, React Router, Axios, SCSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **AI:** Google Gemini API via `@google/genai` Interactions API

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB connection string (local MongoDB or MongoDB Atlas)
- A Google Gemini API key for AI features

## Setup

1. Install the dependencies from the repository root:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Create `backend/.env` with your own local configuration:

   ```dotenv
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   JWT_SECRET=<a-long-random-secret>
   GOOGLE_GENAI_API_KEY=<your-google-ai-api-key>
   # Optional:
   # GEMINI_MODEL=gemini-3.8-flash
   # PORT=3000
   # FRONTEND_URL=https://your-frontend.example.com
   ```

   Keep this file private and do not commit it. `MONGODB_URI` can also be named `MONGO_URI`. The default Gemini model is `gemini-3.8-flash`. MongoDB collections are created by Mongoose when the app saves its first documents; no manual collection setup is required. For MongoDB Atlas, configure the cluster's network access to allow connections from your development machine.

3. Start the API and frontend together:

   ```bash
   npm run dev
   ```

   Open the frontend URL printed by Vite in the terminal (often `http://localhost:5173`). The frontend proxies `/api` requests to the backend at `http://127.0.0.1:3000`. If Vite selects a different port, use the URL it prints.

   To run either part separately:

   ```bash
   npm run dev --prefix backend
   npm run dev --prefix frontend
   ```

## Using the app

1. Register with a name, email, and password of at least eight characters, or sign in.
2. Enter the target job description.
3. Upload a PDF resume (up to 3 MB), or enter a self-description if you do not have a resume ready. Providing both is supported.
4. Select **Build my interview plan**. Gemini creates the tailored report; generation can take time and requests time out after 60 seconds.
5. Review the report and use **Download Resume** to generate a tailored resume PDF.

## API overview

The API runs on port `3000` by default. Authentication uses an HTTP-only `token` cookie; protected requests must include that cookie.

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account | No |
| `POST` | `/api/auth/login` | Sign in | No |
| `POST` | `/api/auth/logout` | Sign out | No |
| `GET` | `/api/auth/get-me` | Get the signed-in user | Yes |
| `POST` | `/api/interview/` | Generate and save an interview plan | Yes |
| `GET` | `/api/interview/` | List recent plans | Yes |
| `GET` | `/api/interview/report/:interviewId` | Get a saved plan | Yes |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Generate a tailored resume PDF | Yes |

Interview plan requests use `multipart/form-data` with:

- `jobDescription` (required)
- `selfDescription` (optional if a resume is uploaded)
- `resume` (optional PDF file, maximum 3 MB)

Example registration JSON:

```json
{
  "username": "Sample Candidate",
  "email": "candidate@example.com",
  "password": "at-least-8-characters"
}
```

## Development checks

Run these commands from the repository root:

```bash
npm run lint
npm run build
npm test
```

## Troubleshooting

- **Frontend does not open:** Use the exact Vite URL printed by `npm run dev`; an old browser tab or a different port may point to a server that is no longer running.
- **MongoDB connection fails:** Check `MONGODB_URI` in `backend/.env`, your Atlas network access rules, and the database credentials. Do not paste connection strings into public logs or issues.
- **AI generation fails or times out:** Confirm `GOOGLE_GENAI_API_KEY` is valid and enabled for the Gemini API, and that the configured model is available to your account. The default request timeout is 60 seconds.
- **Protected API returns 401:** Sign in first and keep cookies enabled. The frontend sends credentials automatically when using the Vite proxy.
- **Resume is rejected:** Use a readable, text-based PDF no larger than 3 MB. Scanned image-only PDFs may not contain extractable text.
