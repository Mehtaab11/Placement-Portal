# 🎓 TPO Portal — Training & Placement Office Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Auth.js](https://img.shields.io/badge/Auth.js-NextAuth_v5-purple?logo=auth0&logoColor=white)](https://authjs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- Add screenshot/GIF here -->

![Dashboard](image.png)

## 📌 Overview

**TPO Portal** is a production-grade, full-stack placement automation platform engineered for universities and engineering colleges. It eliminates manual placement spreadsheets by establishing a unified command center connecting **Students**, **Corporate Recruiters**, and **TPO Administrators**. Built on Next.js 15 App Router, Prisma ORM, and PostgreSQL, the platform streamlines the end-to-end recruitment lifecycle from eligibility-checked job applications to multi-stage pipeline evaluation, async video interview coaching, assessment suites, and institutional analytics.

---

## ✨ Key Features

### 👨‍🎓 Student Portal

- **One-Click Application System**: Instantly apply to active campus placement and internship drives with automated eligibility verification (minimum CGPA, allowed branch, and backlog clearance).
- **Live Application Stage Tracker**: Real-time progress visualizer tracking applications across 5 stages: `APPLIED` → `SHORTLISTED` → `INTERVIEW` → `OFFERED` → `REJECTED`.
- **Profile & Dossier Manager**: Build academic dossiers with semester-wise CGPA, active backlogs, technical skill tags, GitHub/LinkedIn links, and direct PDF/DOCX resume uploads.
- **Drive Discovery Engine**: Filter campus opportunities by role type (`FULL_TIME`, `INTERNSHIP`, `INTERN_PPO`), allowed academic branches, CTC package ranges, and upcoming deadlines.
- **Mock Video Interview Studio**: Async interview practice with live camera recording, think-time countdowns, question navigation, retake options, and multi-factor self-reflection scores (Clarity, Confidence, Content Depth).
- **Mock Assessments & Test Runner**: Practice timed aptitude, technical, and coding MCQ test packages with instant scoring, negative marking calculation, and question explanations.
- **Placement Perks & Subscription Tiers**: Transparent membership tiers (`PRO` & `PREMIUM`) unlocking extended assessment quotas, interview simulations, and verified mentor review feedback.
- **Real-Time Notification Center**: Instant in-app alerts for shortlist announcements, interview schedules, test evaluations, and offer letters.

### 💼 Recruiter Portal

- **Drive Creator & Management**: Post placement drives with comprehensive job descriptions, CTC packages, bond durations, eligible batches, and academic cutoff thresholds.
- **Applicant Pipeline & Filterable Kanban**: Manage candidate workflows with stage transitions, quick filters, and instant candidate profile drawer previews.
- **Smart Candidate Search**: Search candidate pools across names, roll numbers, branches, and verified skills.
- **Resume Viewer & Candidate Dossier**: Instant preview of student CGPA, backlogs, technical skill tags, and direct resume file downloads.
- **Funnel Conversion Analytics**: Real-time throughput metrics calculating conversion ratios from initial applications to final released offers.

### 🛡️ TPO Administrator Portal

- **Master Placement Command Center**: Institutional dashboard monitoring total student placement rates, salary benchmarks, and branch-wise placement progress.
- **Mock Video Interview Review Studio**: Dedicated evaluation desk for inspecting student recordings, reviewing self-evaluations, question-by-question playback, and releasing STAR-framework placement feedback with student notifications.
- **Subscription & Grant Desk**: Monitor upgraded students (`PRO`/`PREMIUM`), inspect active subscriptions, configure plan pricing, and grant institutional fee waivers or passes.
- **Drive Oversight & Status Control**: Full lifecycle control to publish, draft, or close campus placement drives.
- **Master Student Directory**: Multi-criteria search and filtering by branch (with synonym expansion), batch, backlog status, and placement state with **UTF-8 BOM Excel/CSV cohort export**.
- **Partner Company Directory**: Manage verified employer profiles, corporate tiers, and historical hiring statistics.
- **Institutional Analytics & Reports**: Departmental placement summaries, highest/average CTC calculations, and compensation distribution tracking.

### 🌐 System-Wide Features

- **Global Command Search (`⌘K` / `Ctrl+K`)**: Keyboard-accessible global search dropdown providing instant categorized results across drives, student candidates, partner companies, and portal shortcuts.
- **Intelligent Branch Synonym Matcher**: Bidirectional branch expansion bridging acronyms with natural search terms (e.g., `mechanical` ↔ `MECH`, `computer science` ↔ `CSE`, `electronics` ↔ `ECE`, `civil` ↔ `CIVIL`).
- **Feature Flag Architecture**: Safe modular deployment controlled by `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` enabling zero-risk rollout of premium features.
- **Role-Based Access Control (RBAC)**: Secure NextAuth.js v5 JWT sessions with middleware route protection for `/student/*`, `/recruiter/*`, and `/admin/*`.
- **Zero-Flash Theme Engine**: Integrated Light (`#FAFAFA`) and Dark (`#0A0A0B`) theme system with Deep Indigo accents and zero-flicker SSR hydration.

---

## 🛠️ Tech Stack

| Layer                | Technology                                                                                    | Purpose                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Framework**        | [Next.js 15.3.4](https://nextjs.org/)                                                         | App Router, Server Components, Route Handlers, SSR         |
| **Frontend Library** | [React 19.0.0](https://react.dev/)                                                            | Component architecture, Hooks, React Suspense              |
| **Language**         | [TypeScript 5](https://www.typescriptlang.org/)                                               | End-to-end type safety across schemas and UI               |
| **Styling**          | Vanilla CSS Modules                                                                           | Zero-runtime CSS Modules, Custom Design Tokens             |
| **Media Recording**  | HTML5 MediaRecorder API / WebRTC                                                              | Async browser video and audio capture for mock interviews  |
| **Database & ORM**   | [PostgreSQL](https://www.postgresql.org/) + [Prisma 6.7.0](https://www.prisma.io/)            | Relational database schema, migrations, connection pooling |
| **Authentication**   | [NextAuth.js v5 Beta](https://authjs.dev/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | JWT session management, RBAC, password hashing             |
| **Form Management**  | [React Hook Form](https://react-hook-form.com/) + [Zod 3.23](https://zod.dev/)                | Client & server schema validation                          |
| **Icons & Visuals**  | [Lucide React](https://lucide.dev/)                                                           | Consistent, scalable vector UI iconography                 |
| **Analytics Charts** | [Recharts 3.0](https://recharts.org/)                                                         | Data visualization for hiring funnels and placement rates  |

---

## 📐 Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        UI[UI Components / CSS Modules]
        Theme[ThemeProvider / Dark Mode Engine]
        SearchPalette[Global Command Palette - Ctrl+K]
        VideoStudio[HTML5 MediaRecorder Video Studio]
        Forms[React Hook Form + Zod Validation]
    end

    subgraph MiddlewareLayer ["Routing & Security"]
        MW[Edge Middleware - Role Route Guard]
        NextAuth[Auth.js v5 JWT Session]
        FeatureFlag[Feature Flag Guard - NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED]
    end

    subgraph AppRouter ["Next.js 15 App Router"]
        StudentRoutes["/student/* (Drives, Profile, Tests, Video Studio)"]
        RecruiterRoutes["/recruiter/* (Drives, Pipeline Kanban, Analytics)"]
        AdminRoutes["/admin/* (Dossiers, Subscriptions, Video Reviews)"]
        APIRoutes["/api/* (25 RESTful Route Handlers)"]
    end

    subgraph DataAccess ["Data Layer"]
        PrismaClient["Prisma ORM Client (lib/prisma.ts)"]
        PostgresDB[("PostgreSQL Database (Neon / Local)")]
    end

    UI --> Forms
    Forms --> MW
    MW --> NextAuth
    NextAuth --> FeatureFlag
    FeatureFlag --> AppRouter
    StudentRoutes --> PrismaClient
    RecruiterRoutes --> PrismaClient
    AdminRoutes --> PrismaClient
    APIRoutes --> PrismaClient
    PrismaClient --> PostgresDB
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **Database**: Local PostgreSQL instance or a serverless [Neon](https://neon.tech) / [Supabase](https://supabase.com) database
- **Package Manager**: `npm` (v9+), `pnpm`, or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/Mehtaab11/Placement-Portal.git
cd Placement-Portal
```

### 2. Install Dependencies

```bash
npm install
```

_(Prisma Client will be automatically generated via the `postinstall` script)._

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Example / Recommended Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (supports Neon pooler) | `postgresql://postgres:password@localhost:5432/tpo_db` |
| `AUTH_SECRET` | 32+ character random encryption secret for NextAuth | `openssl rand -base64 32` |
| `AUTH_URL` | Canonical app URL for Auth.js callbacks | `http://localhost:3000` |
| `NEXTAUTH_URL` | Application root URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` | **Feature Flag**: Enables Mock Tests, Video Interviews & Subscriptions | `true` |
| `PAYMENT_PROVIDER` | Payment driver (`mock` for sandbox testing, or `razorpay`) | `mock` |
| `OPENAI_API_KEY` | _(Optional)_ OpenAI key for resume analysis | `sk-...` |
| `GEMINI_API_KEY` | _(Optional)_ Google Gemini API key | `AIzaSy...` |

### 4. Setup Database Schema & Seed Data

Push the Prisma schema to your database and seed initial test data:

```bash
# Push schema migrations to PostgreSQL
npm run db:push

# Seed default students, recruiters, admins, active drives, mock tests & templates
npm run db:seed
```

#### Default Seed Credentials

| Role | Email | Password |
|---|---|---|
| **Student** | `student@demo.com` | `Demo@1234` |
| **Recruiter** | `recruiter@demo.com` | `Demo@1234` |
| **TPO Admin** | `admin@demo.com` | `Demo@1234` |

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
Placement-Portal/
├── app/                          # Next.js App Router root
│   ├── (admin)/                  # TPO Admin protected route group
│   │   └── admin/
│   │       ├── analytics/        # Placement rate & CTC benchmark reports
│   │       ├── companies/        # Partner company directory & recruiter verification
│   │       ├── drives/           # Campus drives management & postings
│   │       ├── students/         # Master student directory with CSV cohort export
│   │       ├── subscriptions/    # Subscription plans & manual grant desk
│   │       └── video-interviews/ # Async mock video interview review studio
│   ├── (auth)/                   # Authentication route group (login, register)
│   ├── (recruiter)/              # Recruiter route group
│   │   └── recruiter/
│   │       ├── analytics/        # Recruiter hiring funnel metrics
│   │       ├── company/          # Corporate recruiter profile
│   │       └── drives/           # Drive creator & applicant Kanban pipeline
│   ├── (student)/                # Student route group
│   │   └── student/
│   │       ├── applications/     # Live stage visualizer for submitted applications
│   │       ├── drives/           # Verified campus placement drive directory
│   │       ├── mock-tests/       # MCQ assessment packages & timed test runner
│   │       ├── profile/          # Academic dossier, resume upload & skill tags
│   │       ├── subscription/     # Plans catalog, mock checkout & payment receipts
│   │       └── video-interviews/ # HTML5 video recording studio & self-reflection
│   ├── api/                      # REST API Route Handlers (25 Endpoints)
│   │   ├── admin/                # Admin drives, plans, grants, test management & reviews
│   │   ├── auth/                 # NextAuth route handlers & account registration
│   │   ├── recruiter/            # Drive creation & pipeline stage advancement
│   │   ├── search/               # Role-aware global command search & branch synonyms
│   │   └── student/              # Applications, profile, tests, video studio & checkout
│   ├── globals.css               # Design tokens, neutral grayscale, dark/light theme
│   ├── layout.tsx                # Root layout with zero-flash SSR theme script
│   └── page.tsx                  # Public marketing & role-selection landing page
├── components/                   # Reusable UI component library
│   ├── layout/                   # AppSidebar, AppHeader (with Ctrl+K search), Shell
│   ├── theme/                    # ThemeProvider, ThemeToggle (Sun/Moon switch)
│   └── ui/                       # Design System (Button, Modal, Drawer, Toast, Avatar)
├── lib/                          # Shared utilities & configurations
│   ├── auth.ts                   # NextAuth.js v5 credentials & JWT configuration
│   ├── branchMatcher.ts          # Bidirectional branch synonym & alias matching engine
│   ├── prisma.ts                 # Global Prisma Client singleton instance
│   ├── utils.ts                  # Deterministic formatting, dates, and currency helpers
│   └── validations.ts            # Zod validation schemas
├── prisma/                       # Database layer
│   ├── schema.prisma             # PostgreSQL schema with enums, relations & indexes
│   └── seed.ts                   # Comprehensive database seed script
├── public/                       # Static public assets and resume upload target
├── middleware.ts                 # NextAuth role-based route guard middleware
├── API_DOCUMENTATION.md          # Comprehensive REST API Reference & Testing Guide
└── package.json                  # Dependencies, engine specs, and scripts
```

---

## 🔌 API Reference & Testing Guide

The TPO Portal exposes **25 REST API endpoints** across authentication, student workflows, recruiter applicant pipelines, and administrator reviews.

👉 **[Read the Full API Reference & Testing Guide (`API_DOCUMENTATION.md`)](./API_DOCUMENTATION.md)** for request/response schemas, JSON payloads, and ready-to-run `curl` commands.

### Key API Endpoints Summary

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/search?q={query}` | Global command palette search with branch synonym expansion | All Users |
| `GET` | `/api/student/drives` | Active drives with real-time student eligibility calculation | Student |
| `POST` | `/api/student/applications` | Submit 1-click application with cutoff checks | Student |
| `POST` | `/api/student/mock-tests/start` | Initialize or resume timed MCQ mock assessment | Student |
| `POST` | `/api/student/video-interviews/start` | Launch or resume async video interview recording session | Student |
| `PUT` | `/api/recruiter/applications/[id]/stage` | Advance candidate stage (`SHORTLISTED`, `OFFERED`, etc.) | Recruiter / Admin |
| `POST` | `/api/admin/video-interviews/[sessionId]` | Submit official TPO evaluation feedback & notify student | Admin |
| `POST` | `/api/admin/subscriptions/grant` | Administratively grant complimentary PRO/PREMIUM tier | Admin |

---

## 🗃️ Database Schema

The relational data model is managed via Prisma ORM:

```mermaid
erDiagram
    User ||--o| StudentProfile : "has"
    User ||--o| RecruiterProfile : "has"
    User ||--o{ Notification : "receives"
    Company ||--o{ Drive : "sponsors"
    Drive ||--o{ Application : "receives"
    Drive ||--o| EligibilityCriteria : "defines"
    StudentProfile ||--o{ Application : "submits"
    StudentProfile ||--o{ AcademicRecord : "contains"
    StudentProfile ||--o{ Subscription : "subscribes"
    StudentProfile ||--o{ MockAttempt : "attempts"
    StudentProfile ||--o{ VideoInterviewSession : "records"
    Plan ||--o{ Subscription : "defines"
    MockTestPackage ||--o{ MockTest : "contains"
    MockTest ||--o{ MockQuestion : "has"
    MockTest ||--o{ MockAttempt : "evaluates"
    VideoInterviewTemplate ||--o{ VideoInterviewSession : "templates"
```

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Starts Next.js development server on `http://localhost:3000` |
| `build` | `npm run build` | Compiles optimized production bundle and checks types |
| `start` | `npm start` | Starts production server after build |
| `lint` | `npm run lint` | Runs ESLint analysis across the codebase |
| `db:push` | `npm run db:push` | Syncs Prisma schema directly with PostgreSQL database |
| `db:migrate` | `npm run db:migrate` | Generates and executes database migrations in development |
| `db:studio` | `npm run db:studio` | Launches Prisma Studio GUI for exploring database records |
| `db:seed` | `npm run db:seed` | Executes `prisma/seed.ts` to populate comprehensive demo records |
| `db:reset` | `npm run db:reset` | Drops database, applies schema, and runs seed script |
| `postinstall` | `npm run postinstall` | Automatically executes `prisma generate` upon dependency installation |

---

## 🚢 Deployment (Vercel, Render, Railway)

When deploying to production:

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com/)** or your preferred hosting provider.
3. Configure Environment Variables in the project settings:
   - `DATABASE_URL` (Use your pooled PostgreSQL / Neon connection string)
   - `AUTH_SECRET` (Generate using `openssl rand -base64 32`)
   - `AUTH_URL` (`https://your-domain.vercel.app`)
   - `NEXTAUTH_URL` (`https://your-domain.vercel.app`)
   - `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` (`true`)
   - `PAYMENT_PROVIDER` (`mock` or `razorpay`)
4. Trigger deployment. Next.js will automatically run `prisma generate` during build.
5. In production database, execute `npm run db:seed` to populate plans, mock packages, and templates.

---

## 🗺️ Roadmap

- [x] Next.js 15 App Router & Server Components Architecture
- [x] Multi-Role Authentication with RBAC Guard Middleware
- [x] Candidate Pipeline Kanban & Status Transitions
- [x] Master Student Directory with UTF-8 BOM CSV Export
- [x] Light / Dark Theme Engine with Zero-Flicker Hydration
- [x] Global Command Search (`Ctrl+K`) with Bidirectional Branch Synonym Expansion
- [x] Async Mock Video Interview Recording Studio with Self-Reflection
- [x] Admin Video Interview Evaluation Center with STAR-framework Feedback
- [x] Timed MCQ Mock Test Assessment Engine with Scoring
- [x] Student Subscription Tiers (`PRO`/`PREMIUM`) & Mock Checkout
- [ ] Email notifications for interview schedules (Resend / SendGrid)
- [ ] AI-Powered Resume ATS Compatibility Scorer
- [ ] Automated Interview Scheduling & Google Calendar Integration
- [ ] Comprehensive End-to-End Test Suite (Playwright)

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📬 Author & Contact

- **Maintainer**: Mehtaab
- **GitHub**: [@Mehtaab11](https://github.com/Mehtaab11)
- **Repository**: [Placement-Portal](https://github.com/Mehtaab11/Placement-Portal)
- **Feedback & Issues**: [GitHub Issues](https://github.com/Mehtaab11/Placement-Portal/issues)
