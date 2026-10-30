# 📡 TPO Portal — Backend API Reference & Testing Guide

This document is the comprehensive reference manual for all backend REST API routes in the **TPO Management System**. It outlines each endpoint's purpose, authentication rules, request/response formats, and step-by-step testing instructions using `curl`, Postman, or browser workflows.

---

## 📋 Table of Contents

1. [Authentication & Session Setup](#1-authentication--session-setup)
2. [Feature Flags & Environment Pre-requisites](#2-feature-flags--environment-pre-requisites)
3. [Global Search API](#3-global-search-api)
4. [Student Placement & Profile APIs](#4-student-placement--profile-apis)
5. [Student Subscription & Payments APIs](#5-student-subscription--payments-apis)
6. [Student Mock Assessments APIs](#6-student-mock-assessments-apis)
7. [Student Video Interview APIs](#7-student-video-interview-apis)
8. [Recruiter Drive & Pipeline APIs](#8-recruiter-drive--pipeline-apis)
9. [TPO Admin Management APIs](#9-tpo-admin-management-apis)
10. [End-to-End API Testing Workflows](#10-end-to-end-api-testing-workflows)

---

## 1. Authentication & Session Setup

The portal uses **NextAuth.js v5 (Auth.js)** with JWT session cookies.

### Default Seed Demo Credentials

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Student** | `student@demo.com` | `Demo@1234` | `/api/student/*`, `/api/search` |
| **Recruiter** | `recruiter@demo.com` | `Demo@1234` | `/api/recruiter/*`, `/api/search` |
| **TPO Admin** | `admin@demo.com` | `Demo@1234` | `/api/admin/*`, `/api/recruiter/*`, `/api/search` |

### How to Authenticate with `curl` / Postman

1. **Obtain the Session Cookie via Login**:
   ```bash
   # Log in and save cookies to cookies.txt
   curl -c cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "email=student@demo.com&password=Demo@1234&redirect=false"
   ```
2. **Reuse Session in subsequent calls**:
   ```bash
   curl -b cookies.txt http://localhost:3000/api/student/profile
   ```
3. **Browser Testing**: Simply log in at `http://localhost:3000/login` using the demo one-click pills, then test endpoints directly in browser console (`fetch(...)`) or via the UI.

---

## 2. Feature Flags & Environment Pre-requisites

Certain monetization and AI features require environment flags in `.env.local`:

```env
# Required for Subscriptions, Mock Tests, and Video Interviews
NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED="true"
PAYMENT_PROVIDER="mock"
```

> ⚠️ **Important**: In Next.js, `NEXT_PUBLIC_*` variables are embedded at build time. Always restart your development server (`npm run dev`) or redeploy after modifying this flag.

---

## 3. Global Search API

### `GET /api/search`

Real-time role-aware command palette search across drives, candidates, partner organizations, and portal navigation. Supports intelligent branch synonym matching (e.g. `mechanical` ↔ `MECH`, `computer science` ↔ `CSE`).

- **Role Required**: `STUDENT`, `RECRUITER`, or `ADMIN`
- **Query Parameters**:
  - `q` *(string, required)*: The search term (e.g., `q=mechanical`, `q=Google`, `q=Rahul`).

#### Sample Response (`200 OK`)
```json
{
  "results": [
    {
      "id": "page-/student/drives?search=mechanical",
      "category": "pages",
      "title": "Explore Placement Drives",
      "subtitle": "Browse open campus drives, verify criteria & apply",
      "url": "/student/drives?search=mechanical"
    },
    {
      "id": "drive-cmv...1",
      "category": "drives",
      "title": "Graduate Trainee Engineer",
      "subtitle": "Tata Motors • ₹8–12 LPA • Pune",
      "url": "/student/drives?search=mechanical",
      "badge": "LIVE",
      "meta": "Eligible: MECH, CIVIL"
    }
  ]
}
```

#### How to Test
```bash
# 1. Using curl
curl -b cookies.txt "http://localhost:3000/api/search?q=mechanical"

# 2. In Browser
Press Ctrl+K (or ⌘K) from any dashboard and type "mechanical".
```

---

## 4. Student Placement & Profile APIs

### `GET /api/student/drives`
Lists all active campus placement drives with student-specific eligibility calculations (`isEligible`, `eligibilityReasons`, and `hasApplied`).

- **Role Required**: `STUDENT`
- **Response (`200 OK`)**: `{ "drives": [ ... ] }`

```bash
curl -b cookies.txt http://localhost:3000/api/student/drives
```

---

### `POST /api/student/applications`
Submits a student application to a live placement drive. Validates that the drive is `LIVE` and that the student meets eligibility criteria (min CGPA, allowed branch, max backlogs).

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "driveId": "drive_cuid_here"
  }
  ```
- **Response (`201 Created` / `200 OK` if already applied)**:
  ```json
  {
    "success": true,
    "application": { "id": "...", "stage": "APPLIED" }
  }
  ```

#### How to Test
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/student/applications \
  -H "Content-Type: application/json" \
  -d '{"driveId":"cmvt...example"}'
```

---

### `GET /api/student/profile`
Retrieves the logged-in student's full dossier including personal info, academic records, projects, work experience, and completeness score.

- **Role Required**: `STUDENT`
- **Response (`200 OK`)**: `{ "profile": { ... } }`

```bash
curl -b cookies.txt http://localhost:3000/api/student/profile
```

---

### `PUT /api/student/profile`
Updates profile details, contact information, technical skill tags, social URLs, and project/work experience records.

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "phone": "+91 9876543210",
    "skills": ["React", "TypeScript", "Node.js", "Python"],
    "githubUrl": "https://github.com/student",
    "linkedinUrl": "https://linkedin.com/in/student"
  }
  ```

---

### `POST /api/student/resume`
Uploads a student resume document (`.pdf`, `.docx`). Saves file into `public/uploads/resumes/` and updates the profile's `resumeUrl`.

- **Role Required**: `STUDENT`
- **Body (`multipart/form-data`)**: `file: (Binary Document)`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "resumeUrl": "/uploads/resumes/resume_user_123.pdf",
    "fileName": "My_Resume.pdf"
  }
  ```

#### How to Test
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/student/resume \
  -F "file=@/path/to/resume.pdf"
```

---

## 5. Student Subscription & Payments APIs

*Enabled when `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED=true`.*

### `GET /api/student/subscription/plans`
Retrieves all active subscription plans (e.g. `PRO`, `PREMIUM`) with pricing, duration, and feature limits.

- **Role Required**: `STUDENT`
- **Response (`200 OK`)**: `{ "plans": [ ... ] }`

```bash
curl -b cookies.txt http://localhost:3000/api/student/subscription/plans
```

---

### `GET /api/student/subscription/me`
Returns current student subscription tier, active status, quota limits, days left, and recent payment history.

- **Role Required**: `STUDENT`
- **Response (`200 OK`)**:
  ```json
  {
    "tier": "PREMIUM",
    "isActive": true,
    "usage": {
      "mockTestsThisMonth": 2,
      "videoInterviewsThisMonth": 1
    },
    "features": {
      "mockTestsPerMonth": 100,
      "videoInterviewsPerMonth": 25,
      "reviewedVideoFeedback": true
    }
  }
  ```

---

### `POST /api/student/subscription/checkout`
Initiates a checkout order. Creates a pending `Payment` record and returns provider order metadata.

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "planId": "plan_pro_monthly"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "orderId": "pay_ord_123",
    "amountPaise": 49900,
    "currency": "INR",
    "isDemoMode": true
  }
  ```

---

### `POST /api/student/subscription/confirm`
Confirms a payment and activates the student's subscription. In mock mode (`PAYMENT_PROVIDER=mock`), immediately grants the plan.

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "paymentId": "pay_ord_123",
    "providerPaymentId": "mock_pay_success_123"
  }
  ```
- **Response (`200 OK`)**: `{ "ok": true, "subscriptionId": "sub_..." }`

---

### `POST /api/student/subscription/cancel`
Cancels the active subscription at the end of the billing period.

- **Role Required**: `STUDENT`
- **Response (`200 OK`)**: `{ "ok": true, "canceledAt": "..." }`

---

## 6. Student Mock Assessments APIs

### `POST /api/student/mock-tests/start`
Starts a new mock test attempt or resumes an in-progress attempt. Consumes monthly quota for non-preview tests.

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "testId": "test_cuid_here"
  }
  ```
- **Response (`200 OK` / `201 Created`)**:
  ```json
  {
    "attemptId": "attempt_cuid_123",
    "test": {
      "id": "...",
      "title": "Quantitative Aptitude Sprint",
      "durationMinutes": 30,
      "questions": [ ... ]
    }
  }
  ```

---

### `PATCH /api/student/mock-tests/attempts/[attemptId]`
Autosaves student answers periodically during the test runner.

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "answers": {
      "question_1_id": 2,
      "question_2_id": 0
    }
  }
  ```
- **Response (`200 OK`)**: `{ "ok": true, "savedCount": 2 }`

---

### `POST /api/student/mock-tests/attempts/[attemptId]`
Submits the completed test attempt, calculates raw scores, accuracy, and negative marks, and marks attempt as `SUBMITTED`.

- **Role Required**: `STUDENT`
- **Body (`application/json`)**:
  ```json
  {
    "answers": { "q1": 2, "q2": 1 },
    "timeTakenSec": 845
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "ok": true,
    "score": 18,
    "totalMarks": 20,
    "percentage": 90.0,
    "accuracy": 94.7
  }
  ```

---

## 7. Student Video Interview APIs

### `POST /api/student/video-interviews/start`
Initializes a new mock video interview session for a template (or resumes existing `IN_PROGRESS` session).

- **Role Required**: `STUDENT` (requires `PRO` or `PREMIUM` subscription)
- **Body (`application/json`)**:
  ```json
  {
    "templateId": "tpl_sde_behavioral_01"
  }
  ```
- **Response (`201 Created` / `200 OK`)**:
  ```json
  {
    "sessionId": "session_cuid_123",
    "resumed": false
  }
  ```

---

### `GET /api/student/video-interviews/[sessionId]`
Retrieves full details of a video interview session, including questions, saved answers, and feedback.

- **Role Required**: `STUDENT` (owner) or `ADMIN`
- **Response (`200 OK`)**: `{ "session": { ... } }`

---

### `PATCH /api/student/video-interviews/[sessionId]`
Saves recorded question answers or self-reflection ratings.

- **Role Required**: `STUDENT`
- **Saving Answer**:
  ```json
  {
    "questionId": "q1",
    "answer": {
      "url": "blob:http://localhost:3000/...",
      "storageKey": "video_interviews/student_1/session_1/q1.webm",
      "durationSec": 45
    }
  }
  ```
- **Saving Self-Reflection**:
  ```json
  {
    "selfRating": {
      "clarity": 4,
      "confidence": 5,
      "content": 4
    }
  }
  ```

---

### `POST /api/student/video-interviews/[sessionId]`
Submits the video interview session for TPO review. Updates status to `SUBMITTED`.

- **Role Required**: `STUDENT`
- **Response (`200 OK`)**: `{ "ok": true, "session": { "status": "SUBMITTED" } }`

---

## 8. Recruiter Drive & Pipeline APIs

### `GET /api/recruiter/drives`
Returns all placement drives posted by the authenticated recruiter's organization.

- **Role Required**: `RECRUITER`

```bash
curl -b cookies.txt http://localhost:3000/api/recruiter/drives
```

---

### `POST /api/recruiter/drives`
Publishes a new campus hiring drive with criteria and selection rounds.

- **Role Required**: `RECRUITER`
- **Body (`application/json`)**:
  ```json
  {
    "title": "Associate Software Engineer 2026",
    "description": "Full-stack developer role working on cloud platforms.",
    "jobType": "FULL_TIME",
    "location": "Bangalore / Hybrid",
    "ctcMin": 8.5,
    "ctcMax": 14.0,
    "deadline": "2026-12-15T18:30:00.000Z",
    "minCGPA": 7.0,
    "maxBacklogs": 0,
    "allowedBranches": ["CSE", "IT", "ECE"],
    "rounds": [
      { "name": "Online Coding Assessment", "roundNumber": 1 },
      { "name": "Technical Interview", "roundNumber": 2 },
      { "name": "HR Fitment", "roundNumber": 3 }
    ]
  }
  ```

---

### `PUT /api/recruiter/applications/[id]/stage`
Advances an applicant through pipeline stages (`SHORTLISTED`, `INTERVIEW`, `OFFERED`, `REJECTED`). Automatically logs stage history and delivers notifications to the student.

- **Role Required**: `RECRUITER` or `ADMIN`
- **Body (`application/json`)**:
  ```json
  {
    "stage": "SHORTLISTED",
    "notes": "Cleared preliminary resume screening",
    "interviewTime": "2026-11-10T10:00:00.000Z"
  }
  ```
- **Response (`200 OK`)**: `{ "success": true, "application": { ... } }`

#### How to Test
```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/recruiter/applications/app_123/stage \
  -H "Content-Type: application/json" \
  -d '{"stage":"SHORTLISTED","notes":"Good profile"}'
```

---

## 9. TPO Admin Management APIs

### `POST /api/admin/drives`
Allows TPO administrators to post or update campus drives on behalf of partner corporations.

- **Role Required**: `ADMIN`

---

### `GET /api/admin/subscriptions/plans`
Fetches all subscription plans for administrative pricing and feature tier management.

- **Role Required**: `ADMIN`

---

### `PATCH /api/admin/subscriptions/plans`
Updates pricing or feature configuration for a subscription tier.

- **Role Required**: `ADMIN`
- **Body (`application/json`)**:
  ```json
  {
    "id": "plan_pro_monthly",
    "pricePaise": 39900,
    "isActive": true
  }
  ```

---

### `POST /api/admin/subscriptions/grant`
Enables TPO admins to grant complimentary subscription upgrades (`PRO` / `PREMIUM`) directly to deserving students.

- **Role Required**: `ADMIN`
- **Body (`application/json` or `form-data`)**:
  ```json
  {
    "studentId": "student_cuid_here",
    "planId": "plan_premium_monthly",
    "note": "Granted by TPO Office for Academic Excellence"
  }
  ```
- **Response (`200 OK`)**: `{ "ok": true, "subscriptionId": "sub_..." }`

---

### `POST /api/admin/video-interviews/[sessionId]`
Submits official TPO evaluation feedback for a student's mock video interview submission. Marks status as `REVIEWED` and dispatches an in-app alert to the student.

- **Role Required**: `ADMIN` or `RECRUITER`
- **Body (`application/json`)**:
  ```json
  {
    "reviewerFeedback": "Well structured answers using the STAR method. Work on maintaining direct camera eye contact."
  }
  ```
- **Response (`200 OK`)**: `{ "ok": true, "session": { ... } }`

---

### `POST /api/admin/video-interviews/cleanup`
Administrative maintenance task to purge obsolete video interview recordings older than 90 days.

- **Role Required**: `ADMIN`
- **Response (`200 OK`)**:
  ```json
  {
    "ok": true,
    "deletedCount": 0,
    "threshold": "2026-07-31T01:30:00.000Z"
  }
  ```

---

### `GET /api/admin/mock-tests`
Retrieves all test packages and tests with question/attempt counts for administrative curriculum oversight.

- **Role Required**: `ADMIN`

---

### `POST /api/admin/mock-tests`
Creates a new assessment package.

- **Role Required**: `ADMIN`
- **Body (`application/json`)**:
  ```json
  {
    "title": "Google SDE Prep Pack",
    "slug": "google-sde-prep",
    "category": "TECHNICAL",
    "difficulty": "HARD",
    "requiredTier": "PREMIUM",
    "isPublished": true
  }
  ```

---

### `POST /api/admin/mock-tests/bulk`
Bulk imports an array of MCQ questions into a specific test.

- **Role Required**: `ADMIN`
- **Body (`application/json`)**:
  ```json
  {
    "testId": "test_cuid_123",
    "questions": [
      {
        "prompt": "What is the worst-case time complexity of QuickSort?",
        "options": ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"],
        "correctIndex": 1,
        "explanation": "QuickSort degrades to O(N^2) with poor pivot selection.",
        "marks": 2
      }
    ]
  }
  ```

---

## 10. End-to-End API Testing Workflows

### Scenario A: Testing Student Video Interviews

1. **Log in as Student** (`student@demo.com`).
2. **Start Video Practice**:
   ```bash
   curl -b cookies.txt -X POST http://localhost:3000/api/student/video-interviews/start \
     -H "Content-Type: application/json" \
     -d '{"templateId":"tpl_sde_behavioral_01"}'
   ```
   *Note the returned `sessionId`.*
3. **Save Video Answer**:
   ```bash
   curl -b cookies.txt -X PATCH http://localhost:3000/api/student/video-interviews/<sessionId> \
     -H "Content-Type: application/json" \
     -d '{"questionId":"q1","answer":{"url":"blob:http://localhost:3000/test","storageKey":"test.webm","durationSec":30}}'
   ```
4. **Submit for TPO Review**:
   ```bash
   curl -b cookies.txt -X POST http://localhost:3000/api/student/video-interviews/<sessionId>
   ```
5. **Switch to Admin Session** (`admin@demo.com`) and Release Feedback:
   ```bash
   curl -b admin_cookies.txt -X POST http://localhost:3000/api/admin/video-interviews/<sessionId> \
     -H "Content-Type: application/json" \
     -d '{"reviewerFeedback":"Great presentation and clear articulation!"}'
   ```

---

### Scenario B: Testing Global Command Search with Synonyms

1. Open `http://localhost:3000/student/dashboard`.
2. Press `Ctrl + K` or click the search bar.
3. Type:
   - `mechanical` ➔ Matches drives allowing `MECH`, mechanical students, and drives.
   - `computer science` ➔ Matches `CSE` drives and software engineering roles.
   - `interview` ➔ Direct navigation to AI Video Interviews.
4. Press `Enter` on any highlighted item to navigate directly.

---

### Summary Checklist of All 25 Endpoints

| # | HTTP Method | Endpoint Path | Role Allowed | Feature Flag Guard |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/register` | Public | None |
| 2 | `GET, POST`| `/api/auth/[...nextauth]` | Public | None |
| 3 | `GET` | `/api/search` | Student / Recruiter / Admin | None |
| 4 | `GET` | `/api/student/drives` | Student | None |
| 5 | `GET, POST`| `/api/student/applications` | Student | None |
| 6 | `GET, PUT` | `/api/student/profile` | Student | None |
| 7 | `POST, DELETE`| `/api/student/resume` | Student | None |
| 8 | `POST` | `/api/student/mock-tests/start` | Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 9 | `GET, POST, PATCH`| `/api/student/mock-tests/attempts/[attemptId]`| Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 10 | `POST` | `/api/student/video-interviews/start` | Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 11 | `GET, PATCH, POST`| `/api/student/video-interviews/[sessionId]` | Student / Admin | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 12 | `GET` | `/api/student/subscription/plans` | Student | None |
| 13 | `GET` | `/api/student/subscription/me` | Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 14 | `POST` | `/api/student/subscription/checkout` | Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 15 | `POST` | `/api/student/subscription/confirm` | Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 16 | `POST` | `/api/student/subscription/cancel` | Student | `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` |
| 17 | `GET, POST`| `/api/recruiter/drives` | Recruiter | None |
| 18 | `PUT` | `/api/recruiter/applications/[id]/stage` | Recruiter / Admin | None |
| 19 | `POST` | `/api/admin/drives` | Admin | None |
| 20 | `GET, PATCH`| `/api/admin/subscriptions/plans` | Admin | None |
| 21 | `POST` | `/api/admin/subscriptions/grant` | Admin | None |
| 22 | `POST` | `/api/admin/video-interviews/[sessionId]` | Admin / Recruiter | None |
| 23 | `POST` | `/api/admin/video-interviews/cleanup` | Admin | None |
| 24 | `GET, POST`| `/api/admin/mock-tests` | Admin | None |
| 25 | `POST` | `/api/admin/mock-tests/bulk` | Admin | None |

