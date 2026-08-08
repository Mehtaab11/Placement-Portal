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

**TPO Portal** is a production-grade, full-stack placement automation platform engineered for universities and engineering colleges. It eliminates manual placement spreadsheets by establishing a unified command center connecting **Students**, **Corporate Recruiters**, and **TPO Administrators**. Built on Next.js 15 App Router, Prisma ORM, and PostgreSQL, the platform streamlines the end-to-end recruitment lifecycle from eligibility-checked job applications to multi-stage pipeline evaluation and institutional analytics.

---

## ✨ Key Features

### 👨‍🎓 Student Portal

- **One-Click Application System**: Instantly apply to active campus placement and internship drives with automated eligibility verification (minimum CGPA, allowed branch, and backlog clearance).
- **Live Application Stage Tracker**: Real-time progress visualizer tracking applications across 5 stages: `APPLIED` → `SHORTLISTED` → `INTERVIEW` → `OFFERED` → `REJECTED`.
- **Profile & Dossier Manager**: Build academic dossiers with semester-wise CGPA, active backlogs, technical skill tags, GitHub/LinkedIn links, and direct PDF/DOCX resume uploads.
- **Drive Discovery Engine**: Filter campus opportunities by role type (`FULL_TIME`, `INTERNSHIP`, `INTERN_PPO`), allowed academic branches, CTC package ranges, and upcoming deadlines.
- **Real-Time Notification Center**: Instant in-app alerts for shortlist announcements, interview schedules, and offer letters.

### 💼 Recruiter Portal

- **Drive Creator & Management**: Post placement drives with comprehensive job descriptions, CTC packages, bond durations, eligible batches, and academic cutoff thresholds.
- **Applicant Pipeline Kanban / Table**: Manage candidate workflows with stage transitions and candidate profile drawer previews.
- **Resume Viewer & Candidate Dossier**: Instant preview of student CGPA, backlogs, technical skill tags, and direct resume file downloads.
- **Funnel Conversion Analytics**: Real-time throughput metrics calculating conversion ratios from initial applications to final released offers.

### 🛡️ TPO Administrator Portal

- **Master Placement Command Center**: Institutional dashboard monitoring total student placement rates, salary benchmarks, and branch-wise placement progress.
- **Drive Oversight & Status Control**: Full lifecycle control to publish, draft, or close campus placement drives.
- **Master Student Directory**: Multi-criteria search and filtering by branch, batch, backlog status, and placement state with **UTF-8 BOM Excel/CSV cohort export**.
- **Partner Company Directory**: Manage verified employer profiles, corporate tiers, and historical hiring statistics.
- **Institutional Analytics & Reports**: Departmental placement summaries, highest/average CTC calculations, and compensation distribution tracking.

### 🌐 System-Wide Features

- **Role-Based Access Control (RBAC)**: Secure NextAuth.js v5 JWT sessions with middleware route protection for `/student/*`, `/recruiter/*`, and `/admin/*`.
- **Zero-Flash Theme Engine**: Integrated Light (`#FAFAFA`) and Dark (`#0A0A0B`) theme system with Deep Indigo accents and zero-flicker SSR hydration.
- **Global Command Search**: Keyboard-accessible global search shortcut (`Ctrl+K` / `⌘K`) across students, drives, and partner organizations.

---

## 🛠️ Tech Stack

| Layer                | Technology                                                                                    | Purpose                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Framework**        | [Next.js 15.3.4](https://nextjs.org/)                                                         | App Router, Server Components, Route Handlers, SSR         |
| **Frontend Library** | [React 19.0.0](https://react.dev/)                                                            | Component architecture, Hooks, React Suspense              |
| **Language**         | [TypeScript 5](https://www.typescriptlang.org/)                                               | End-to-end type safety across schemas and UI               |
| **Styling**          | Vanilla CSS Modules                                                                           | Zero-runtime CSS Modules, Custom Design Tokens             |
| **Database & ORM**   | [PostgreSQL](https://www.postgresql.org/) + [Prisma 6.7.0](https://www.prisma.io/)            | Relational database schema, migrations, connection pooling |
| **Authentication**   | [NextAuth.js v5 Beta](https://authjs.dev/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | JWT session management, RBAC, password hashing             |
| **Form Management**  | [React Hook Form](https://react-hook-form.com/) + [Zod 3.23](https://zod.dev/)                | Client & server schema validation                          |
| **Icons & Visuals**  | [Lucide React](https://lucide.dev/)                                                           | Consistent, scalable vector UI iconography                 |
| **Analytics Charts** | [Recharts 3.0](https://recharts.org/)                                                         | Data visualization for hiring funnels and placement rates  |

---

## 📐 Architecture

The application follows Next.js App Router architecture leveraging Server Components for data fetching and Client Components for interactivity.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        UI[UI Components / CSS Modules]
        Theme[ThemeProvider / Dark Mode Engine]
        Forms[React Hook Form + Zod Validation]
    end

    subgraph MiddlewareLayer ["Routing & Security"]
        MW[Edge Middleware - Role Route Guard]
        NextAuth[Auth.js v5 JWT Session]
    end

    subgraph AppRouter ["Next.js 15 App Router"]
        StudentRoutes["/student/* (Server & Client Pages)"]
        RecruiterRoutes["/recruiter/* (Pipeline & Drives)"]
        AdminRoutes["/admin/* (Directory & Analytics)"]
        APIRoutes["/api/* (REST Route Handlers)"]
    end

    subgraph DataAccess ["Data Layer"]
        PrismaClient["Prisma ORM Client (lib/prisma.ts)"]
        PostgresDB[("PostgreSQL Database (Neon / Local)")]
    end

    UI --> Forms
    Forms --> MW
    MW --> NextAuth
    NextAuth --> AppRouter
    StudentRoutes --> PrismaClient
    RecruiterRoutes --> PrismaClient
    AdminRoutes --> PrismaClient
    APIRoutes --> PrismaClient
    PrismaClient --> PostgresDB
```

---

## 📸 Live Demo & Screenshots

<!-- Add demo link -->

**To be added**

> 🔗 **Live Demo**: _[To be added]_

**To be added**

<!-- Add screenshots -->

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

<details>
<summary><b>View Environment Variables Reference</b></summary>

| Variable         | Description                                         | Example / Default                                      |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string (supports Neon pooler) | `postgresql://postgres:password@localhost:5432/tpo_db` |
| `AUTH_SECRET`    | 32+ character random encryption secret for NextAuth | `openssl rand -base64 32`                              |
| `AUTH_URL`       | Canonical app URL for Auth.js callbacks             | `http://localhost:3000`                                |
| `NEXTAUTH_URL`   | Application root URL                                | `http://localhost:3000`                                |
| `OPENAI_API_KEY` | _(Optional)_ OpenAI key for future AI features      | `sk-...`                                               |
| `GEMINI_API_KEY` | _(Optional)_ Gemini key for future AI features      | `AIzaSy...`                                            |

</details>

### 4. Setup Database Schema & Seed Data

Push the Prisma schema to your database and seed initial test data:

```bash
# Push schema migrations to PostgreSQL
npm run db:push

# Seed default students, recruiters, admins, and active drives
npm run db:seed
```

#### Default Seed Credentials

| Role          | Email                | Password    |
| ------------- | -------------------- | ----------- |
| **Student**   | `student@demo.com`   | `Demo@1234` |
| **Recruiter** | `recruiter@demo.com` | `Demo@1234` |
| **TPO Admin** | `admin@demo.com`     | `Demo@1234` |

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
│   │   └── admin/                # Dashboard, drives, students directory, reports
│   ├── (auth)/                   # Authentication route group (login, register)
│   ├── (recruiter)/              # Recruiter route group (drives, pipeline, analytics)
│   ├── (student)/                # Student route group (dashboard, applications, profile)
│   ├── api/                      # REST API Route Handlers
│   │   ├── auth/                 # NextAuth route handlers & registration
│   │   ├── recruiter/            # Drive creation, stage transition endpoints
│   │   └── student/              # Application submission, profile, resume upload
│   ├── globals.css               # Design tokens, neutral grayscale, dark/light theme
│   ├── layout.tsx                # Root layout with zero-flash SSR theme script
│   └── page.tsx                  # Public marketing & role-selection landing page
├── components/                   # Reusable UI component library
│   ├── features/                 # Domain-specific components (Settings, Pipeline)
│   ├── layout/                   # AppSidebar, AppHeader, navigation components
│   ├── theme/                    # ThemeProvider, ThemeToggle (Sun/Moon switch)
│   └── ui/                       # Design System (Button, Modal, Drawer, DataTable, etc.)
├── lib/                          # Shared utilities & configurations
│   ├── auth.ts                   # NextAuth.js v5 credentials & JWT configuration
│   ├── prisma.ts                 # Global Prisma Client singleton instance
│   ├── utils.ts                  # Deterministic date formatting & helper utilities
│   └── validations.ts            # Zod validation schemas
├── prisma/                       # Database layer
│   ├── schema.prisma             # PostgreSQL schema with enums, relations & indexes
│   └── seed.ts                   # Database seed script for demo testing
├── public/                       # Static public assets and resume upload target
├── middleware.ts                 # NextAuth role-based route guard middleware
├── package.json                  # Dependencies, engine specs, and scripts
└── tsconfig.json                 # Strict TypeScript configuration
```

---

## 🔌 API Reference

<details>
<summary><b>View Key REST API Endpoints</b></summary>

| Method | Endpoint                                 | Description                                                       | Auth Required     |
| ------ | ---------------------------------------- | ----------------------------------------------------------------- | ----------------- |
| `POST` | `/api/auth/register`                     | Register a new student or recruiter account                       | Public            |
| `GET`  | `/api/student/drives`                    | List all active placement drives with eligibility info            | Student           |
| `POST` | `/api/student/applications`              | Submit application to a placement drive                           | Student           |
| `GET`  | `/api/student/applications`              | Retrieve student's submitted applications                         | Student           |
| `GET`  | `/api/student/profile`                   | Fetch complete student profile dossier                            | Student           |
| `POST` | `/api/student/profile`                   | Update student profile details and skills                         | Student           |
| `POST` | `/api/student/resume`                    | Upload student resume file (PDF/DOCX)                             | Student           |
| `GET`  | `/api/recruiter/drives`                  | Fetch drives posted by logged-in recruiter                        | Recruiter         |
| `POST` | `/api/recruiter/drives`                  | Post a new placement drive                                        | Recruiter         |
| `POST` | `/api/recruiter/applications/[id]/stage` | Advance applicant pipeline stage (`SHORTLISTED`, `OFFERED`, etc.) | Recruiter / Admin |

</details>

---

## 🗃️ Database Schema

The database model is structured around relational entities managed via Prisma ORM:

```mermaid
erDiagram
    User ||--o| StudentProfile : "has"
    User ||--o| Company : "manages"
    User ||--o{ Notification : "receives"
    Company ||--o{ PlacementDrive : "sponsors"
    PlacementDrive ||--o{ Application : "receives"
    StudentProfile ||--o{ Application : "submits"
    StudentProfile ||--o{ AcademicRecord : "contains"
    StudentProfile ||--o{ Project : "showcases"
    StudentProfile ||--o{ WorkExperience : "includes"
```

- **`User`**: Authentication entity holding email, password hash, and `Role` (`STUDENT`, `RECRUITER`, `ADMIN`).
- **`StudentProfile`**: Academic and placement tracking data (roll number, branch, CGPA, backlogs, resume URL, placement status).
- **`Company`**: Employer records with tier status, industry category, and verification state.
- **`PlacementDrive`**: Campus hiring events containing package CTC, eligibility criteria, deadline, and `DriveStatus` (`PUBLISHED`, `DRAFT`, `CLOSED`).
- **`Application`**: Relational junction connecting a Student to a Placement Drive with `ApplicationStage` state tracking.
- **`Notification`**: System notifications dispatched for stage changes and announcement broadcasts.

---

## 📜 Available Scripts

| Script        | Command               | Purpose                                                               |
| ------------- | --------------------- | --------------------------------------------------------------------- |
| `dev`         | `npm run dev`         | Starts Next.js development server on `http://localhost:3000`          |
| `build`       | `npm run build`       | Compiles optimized production bundle and checks types                 |
| `start`       | `npm start`           | Starts production server after build                                  |
| `lint`        | `npm run lint`        | Runs ESLint analysis across the codebase                              |
| `db:push`     | `npm run db:push`     | Syncs Prisma schema directly with the database without migrations     |
| `db:migrate`  | `npm run db:migrate`  | Generates and executes database migrations in development             |
| `db:studio`   | `npm run db:studio`   | Launches Prisma Studio GUI for exploring database records             |
| `db:seed`     | `npm run db:seed`     | Executes `prisma/seed.ts` to populate demo database records           |
| `db:reset`    | `npm run db:reset`    | Drops database, applies schema, and runs seed script                  |
| `postinstall` | `npm run postinstall` | Automatically executes `prisma generate` upon dependency installation |

---

## 🧪 Testing

> ℹ️ **Status**: Automated test suites (Jest / Playwright) are currently planned on the project roadmap. Manual QA and TypeScript build validations (`tsc --noEmit` and `next build`) are executed on every release.

---

## 🚢 Deployment

### Deploying to Vercel (Recommended)

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com/)**.
3. Add the production environment variables:
   - `DATABASE_URL` (Use your pooled PostgreSQL / Neon connection string)
   - `AUTH_SECRET` (Generate using `openssl rand -base64 32`)
   - `AUTH_URL` (`https://your-domain.vercel.app`)
   - `NEXTAUTH_URL` (`https://your-domain.vercel.app`)
4. Click **Deploy**. Vercel will automatically trigger `prisma generate` during build.

---

## 🗺️ Roadmap

- [x] Next.js 15 App Router & Server Components Migration
- [x] Multi-Role Authentication with RBAC Guard Middleware
- [x] Candidate Pipeline Kanban & Status Transitions
- [x] Master Student Directory with UTF-8 BOM CSV Export
- [x] Light / Dark Theme Engine with Zero-Flicker Hydration
- [ ] Email notifications for interview schedules (Resend / SendGrid)
- [ ] AI-Powered Resume ATS Compatibility Scorer
- [ ] Automated Interview Scheduling & Google Calendar Integration
- [ ] Comprehensive End-to-End Test Suite (Playwright)

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your descriptive commit message"`
4. Push to your branch: `git push origin feat/your-feature-name`
5. Open a **Pull Request** detailing your changes.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📬 Author & Contact

- **Maintainer**: Mehtaab
- **GitHub**: [@Mehtaab11](https://github.com/Mehtaab11)
- **Repository**: [Placement-Portal](https://github.com/Mehtaab11/Placement-Portal)
- **Feedback & Issues**: [GitHub Issues](https://github.com/Mehtaab11/Placement-Portal/issues)
