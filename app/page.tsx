import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle,
  BarChart3,
  Bell,
  Lock,
  ArrowRight,
  TrendingUp,
  Users,
} from "lucide-react";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TPO Portal — The Future of Campus Placements",
  description:
    "A unified center bridging the gap between ambitious students, top-tier recruiters, and institutional administration.",
};

const FEATURES = [
  {
    icon: Bell,
    title: "Alerts",
    description:
      "Instant notifications for interview schedules, shortlist updates, and offer letters in real time.",
    color: "#4F46E5",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Live placement rates, branch-wise stats, and hiring funnel analysis for data-driven decisions.",
    color: "#059669",
  },
  {
    icon: Lock,
    title: "Secure & Compliant",
    description:
      "Role-based access control ensures student data and company information stay protected.",
    color: "#2563EB",
  },
];

const ROLES = [
  {
    icon: GraduationCap,
    title: "For Students",
    items: [
      "One-click profile building and resume upload",
      "Track application status in real-time",
      "AI-powered ATS score and suggestions",
      "Access company resources and prep materials",
    ],
    cta: "Student Login",
    href: "/login",
    color: "#4F46E5",
  },
  {
    icon: Briefcase,
    title: "For Recruiters",
    items: [
      "Post and manage placement drives end-to-end",
      "Advanced eligibility filtering",
      "Schedule assessments and interviews",
      "Bulk shortlisting and offer management",
    ],
    cta: "Recruiter Access",
    href: "/login",
    color: "#059669",
  },
  {
    icon: ShieldCheck,
    title: "For TPO Admins",
    items: [
      "Comprehensive dashboard for drive oversight",
      "Verify and onboard companies",
      "Automated placement report generation",
      "Full student and drive lifecycle management",
    ],
    cta: "Admin Access",
    href: "/login",
    color: "#4F46E5",
  },
];

import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>TP</span>
          <span className={styles.navLogoText}>TPO Portal</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>
            Features
          </a>
          <a href="#roles" className={styles.navLink}>
            Solutions
          </a>
          <a href="#stats" className={styles.navLink}>
            Contact
          </a>
        </div>
        <div className={styles.navActions}>
          <ThemeToggle id="landing-theme-toggle" />
          <Link href="/login" className={styles.navSignIn}>
            Sign In
          </Link>
          <Link href="/register" className={styles.navCTA}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroChip}>
          <span className={styles.chipDot} aria-hidden="true" />
          TPO Portal v2.0 is Live
        </div>
        <h1 className={styles.heroTitle}>
          The Future of
          <br />
          <span className={styles.heroAccent}>Campus Placements.</span>
        </h1>
        <p className={styles.heroDesc}>
          A unified command center bridging the gap between ambitious students,
          top-tier recruiters, and institutional administration. Streamline
          drives, track analytics, and accelerate careers.
        </p>
        <div className={styles.heroActions}>
          <Link
            href="/login?role=STUDENT"
            className={styles.heroBtn}
            id="hero-student-login"
          >
            <GraduationCap size={18} />
            Student Login
          </Link>
          <Link
            href="/login?role=RECRUITER"
            className={styles.heroBtnSecondary}
            id="hero-recruiter-login"
          >
            <Briefcase size={18} />
            Recruiter Access
          </Link>
          <Link
            href="/login?role=ADMIN"
            className={styles.heroBtnSecondary}
            id="hero-admin-login"
          >
            <ShieldCheck size={16} />
            TPO Admin
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section
        className={styles.stats}
        id="stats"
        aria-label="Platform statistics"
      >
        <div className={styles.statItem}>
          <TrendingUp
            size={24}
            className={styles.statIcon}
            aria-hidden="true"
          />
          <span className={styles.statValue}>4,200+</span>
          <span className={styles.statLabel}>Students Registered</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <Users size={24} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>156</span>
          <span className={styles.statLabel}>Companies Onboarded</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <Briefcase size={24} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>24</span>
          <span className={styles.statLabel}>Active Drives</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <BarChart3 size={24} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>68%</span>
          <span className={styles.statLabel}>Placement Rate</span>
        </div>
      </section>

      {/* Features */}
      <section
        className={styles.features}
        id="features"
        aria-label="Platform features"
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Everything you need, in one place.
          </h2>
          <p className={styles.sectionDesc}>
            Purpose-built tools that eliminate spreadsheets and WhatsApp chains
            from the placement process.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  <Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role cards */}
      <section
        className={styles.roles}
        id="roles"
        aria-label="Solutions by role"
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            One Platform. Tailored Experiences.
          </h2>
          <p className={styles.sectionDesc}>
            Purpose-built interfaces designed for the unique workflows of every
            stakeholder in the placement process.
          </p>
        </div>
        <div className={styles.rolesGrid}>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className={styles.roleCard}>
                <div className={styles.roleIcon} style={{ color: r.color }}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.roleTitle}>{r.title}</h3>
                <ul className={styles.roleList}>
                  {r.items.map((item) => (
                    <li key={item} className={styles.roleItem}>
                      <CheckCircle
                        size={14}
                        className={styles.roleCheck}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={r.href}
                  className={styles.roleCTA}
                  style={{ color: r.color }}
                >
                  {r.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerLogo}>TPO Portal</span>
          <span className={styles.footerCopy}>
            © 2024 Placement Management System. All rights reserved.
          </span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>
            Privacy
          </a>
          <a href="#" className={styles.footerLink}>
            Terms
          </a>
          <a href="#" className={styles.footerLink}>
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
