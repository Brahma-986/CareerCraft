# CareerCraft

CareerCraft is a MERN application that helps job seekers analyze a PDF resume against a job description, review skill gaps, and prepare for interviews. Resume analysis, interview questions, suggested answers, and the career assistant are generated with the Google Gemini API. Nothing in the product is presented as an official ATS score.

## Features

- Account registration, login, profile updates, and password changes
- JWT-protected API routes and user-level ownership checks
- PDF upload, text extraction, and temporary-file cleanup
- Estimated resume-to-job match score, matching skills, and prioritized skill gaps
- Resume improvement notes that do not invent employers, metrics, or achievements
- Technical, HR, and project interview questions with suggested answers
- Session chat with optional context from a saved analysis
- Dashboard statistics and analysis history stored in MongoDB

## Stack

- React 19, Vite, Tailwind CSS 4, React Router, Axios, Lucide, Recharts
- Node.js, Express 5, Mongoose, JWT, bcryptjs, Multer, pdf-parse
- Google Gemini through `@google/genai`
- MongoDB Atlas in normal use, and an in-memory MongoDB server for automated tests

## Project layout

```text
CareerCraft/
├── frontend/          React application
├── backend/           Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── uploads/tmp/   temporary PDFs, deleted after extraction
├── render.yaml
└── package.json       root scripts for dev, test, and build
```

## Prerequisites

- Node.js 20.17 or newer. The frontend uses Vite 6 so it can build on 20.17. Vite 8 needs Node 20.19 or newer.
- A MongoDB Atlas connection string
- A Google Gemini API key

The API starts only when `MONGO_URI` and `JWT_SECRET` are set. AI routes return a clear setup error when `GEMINI_API_KEY` is missing. They do not invent analysis results.

## Local setup

1. Install dependencies from the repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Create the environment files.

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

On macOS or Linux, use `cp` instead of `copy`.

3. Edit `backend/.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. Default `5000`. |
| `NODE_ENV` | `development` locally, `production` on Render. |
| `MONGO_URI` | MongoDB Atlas connection string for the `careercraft` database. |
| `JWT_SECRET` | Random string, at least 32 characters in production. |
| `JWT_EXPIRES_IN` | Token lifetime. Default `7d`. |
| `CLIENT_URL` | Allowed browser origin. Use a comma-separated list if you have more than one. |
| `GEMINI_API_KEY` | Google Gemini API key. Keep this only on the server. |
| `GEMINI_MODEL` | Supported model name. Default `gemini-3.5-flash`. |
| `MAX_FILE_SIZE_MB` | PDF size limit, from 1 to 15. Default `5`. |
| `AUTH_RATE_LIMIT` | Auth attempts per 15 minutes. Default `20`. |
| `AI_RATE_LIMIT` | AI requests per 15 minutes. Default `30`. |

4. Edit `frontend/.env` if the API is not on `http://localhost:5000/api`:

```text
VITE_API_URL=http://localhost:5000/api
VITE_MAX_FILE_MB=5
```

Keep `VITE_MAX_FILE_MB` equal to `MAX_FILE_SIZE_MB`.

5. Start both servers:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API health check: http://localhost:5000/api/health

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the API and the Vite dev server together. |
| `npm test` | Runs backend unit and API tests. |
| `npm run build` | Creates the frontend production build. |
| `npm start` | Starts the API only. |

Backend-only commands, from `backend/`:

```bash
npm run dev
npm test
npm start
```

## API

All successful responses use `{ success, message, data }`. Errors use `{ success: false, message }`. Protected routes expect `Authorization: Bearer <token>`.

### Auth

- `POST /api/auth/register` — name, email, password, optional confirmPassword
- `POST /api/auth/login` — email, password
- `GET /api/auth/me`

### Resumes

- `POST /api/resume/upload` — multipart field `resume`, PDF only
- `GET /api/resume`
- `GET /api/resume/:id`
- `DELETE /api/resume/:id`

Uploaded PDFs are stored under `backend/uploads/tmp` with a random name, parsed, then deleted. Only the extracted text is saved. Image-only or scanned PDFs are rejected because this app does not run OCR.

### Analysis

- `POST /api/analysis/analyze` — `{ resumeId, jobDescription }`
- `GET /api/analysis/history`
- `GET /api/analysis/:id`
- `DELETE /api/analysis/:id`

The match score is an estimated compatibility score from 0 to 100. It is not an official ATS score.

### Interview and chat

- `POST /api/interview/generate` — `{ analysisId }`
- `POST /api/interview/answer` — `{ analysisId, question }`
- `POST /api/chat` — `{ message, history, analysisId? }`

Chat history is kept in the browser session and sent with each request. It is not stored in MongoDB.

### Dashboard and profile

- `GET /api/dashboard/stats`
- `GET /api/profile`
- `PUT /api/profile` — name, email, and optional `currentPassword` plus `newPassword`

## Deployment

### Full-Stack Monorepo on Vercel (Recommended)

CareerCraft is configured for single-project full-stack deployment on Vercel with the React frontend and serverless Express API under the same domain.

1. **Push your code to GitHub** (or connect via the Vercel CLI).
2. **Import the repository in Vercel**:
   - Leave the **Root Directory** as `./` (the repository root).
   - The build command (`npm install --prefix frontend && npm run build --prefix frontend`) and output directory (`frontend/dist`) are already configured in `vercel.json`.
3. **Configure Environment Variables in Vercel Settings**:
   | Variable | Value | Notes |
   | --- | --- | --- |
   | `NODE_ENV` | `production` | Required |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | 32+ character random secret | Required |
   | `GEMINI_API_KEY` | Your Google Gemini API Key | Required |
   | `GEMINI_MODEL` | `gemini-3.5-flash` | Default supported model |

4. **MongoDB Atlas Network Access**:
   Because Vercel serverless functions run across dynamic IP ranges, navigate to **Atlas > Network Access** and add `0.0.0.0/0` (Allow access from anywhere).

5. **Deploy**:
   Click **Deploy**. Once built, your entire app (frontend UI at `/` and backend API at `/api/*`) will be live under your Vercel URL!

### Alternative: API on Render & Frontend on Vercel

`render.yaml` describes a Node web service rooted at `backend`. Set these environment variables in the Render dashboard and do not commit their values:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET` (32 characters or more)
- `CLIENT_URL` set to the deployed frontend origin, for example `https://your-app.vercel.app`
- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-3.5-flash`

The production server trusts one proxy hop so rate limits use the client IP behind Render.

### Frontend on Vercel

Set the project root to `frontend`. Add:

```text
VITE_API_URL=https://your-api.onrender.com/api
VITE_MAX_FILE_MB=5
```

`frontend/vercel.json` rewrites client routes to `index.html`. `VITE_API_URL` is read at build time, so redeploy the frontend after changing it.

### MongoDB Atlas

1. Create a cluster and a database user.
2. Allow the machines that will connect. For local development, add your current IP under Atlas Network Access. For a first Render deployment you can allow `0.0.0.0/0`, then tighten the access list. If startup says the cluster could not be reached because the IP is not allowed, add that IP and restart the API.
3. Copy the connection string into `MONGO_URI` and include the database name `careercraft`.

## Security notes

- Passwords are hashed with bcryptjs and are excluded from API responses.
- Gemini credentials stay in backend environment variables.
- Resume and job-description text is treated as untrusted data in the model prompts.
- Auth and AI routes are rate limited.
- Users can read and delete only their own resumes and analyses.
- Do not commit `.env` files. `.env.example` files contain placeholders only.

## Tests

`npm test` covers registration, duplicate accounts, login failures, expired tokens, PDF extraction, scanned-PDF rejection, analysis persistence, cross-user access, malformed model JSON, interview answers, chat, profile updates, history deletion, and a missing Gemini key.

The suite uses `mongodb-memory-server` and a fake Gemini client. It does not call Google or Atlas.

## Limitations

- Scanned resumes need OCR, which is not included.
- Very long resumes and job descriptions are clipped before they are sent to Gemini.
- The chat transcript exists only for the current browser session.
- Match scores are model estimates and can vary between runs.
- Live Gemini and Atlas checks require your own credentials. Automated tests do not use them.
