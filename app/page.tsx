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
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
} from "lucide-react";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "TPO Portal — Campus Placement System",
  description:
    "A simple and reliable portal for students to find placement drives, recruiters to hire talent, and colleges to manage campus placements.",
};

const FEATURES = [
  {
    icon: Bell,
    title: "Live Alerts",
    description:
      "Get instant updates when new drives open, shortlists are announced, and interview rounds are scheduled.",
    color: "#4F46E5",
  },
  {
    icon: BarChart3,
    title: "Placement Tracking",
    description:
      "View live placement stats, branch results, and hiring numbers to keep track of student job outcomes.",
    color: "#059669",
  },
  {
    icon: Lock,
    title: "Safe & Private",
    description:
      "Protected accounts and verified student profiles make sure your resume and placement data remain completely safe.",
    color: "#2563EB",
  },
];

const ROLES = [
  {
    icon: GraduationCap,
    title: "For Students",
    items: [
      "Quick profile creation and resume upload",
      "Real-time application status updates",
      "Instant alerts for shortlisted rounds",
      "Company job details and criteria guides",
    ],
    cta: "Student Login",
    href: "/login?role=STUDENT",
    color: "#4F46E5",
  },
  {
    icon: Briefcase,
    title: "For Recruiters",
    items: [
      "Post campus hiring drives with ease",
      "Filter candidates by CGPA and branch",
      "Schedule interviews and assessment rounds",
      "Issue final offers to selected students",
    ],
    cta: "Recruiter Access",
    href: "/login?role=RECRUITER",
    color: "#059669",
  },
  {
    icon: ShieldCheck,
    title: "For TPO Admins",
    items: [
      "Full oversight of all active campus drives",
      "Verify recruiter and company accounts",
      "Export placement reports and cohort stats",
      "Support students across every hiring round",
    ],
    cta: "Admin Access",
    href: "/login?role=ADMIN",
    color: "#4F46E5",
  },
];

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
          <a href="#contact" className={styles.navLink}>
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
          A simple and reliable platform connecting college students, company recruiters, and placement officers to organize campus drives, track application stages, and secure job offers.
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
            Everything you need in one place
          </h2>
          <p className={styles.sectionDesc}>
            Clear and easy tools that help manage campus interviews, student applications, and placement updates without any spreadsheet confusion.
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
            Designed for Everyone on Campus
          </h2>
          <p className={styles.sectionDesc}>
            Dedicated and simple dashboard views created specifically for students applying to jobs, recruiters hiring candidates, and placement teams.
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

      {/* Contact Section */}
      <section
        className={styles.contact}
        id="contact"
        aria-label="Contact placement cell"
      >
        <div className={styles.sectionHeader}>
          <div className={styles.contactBadge}>
            <MessageSquare size={14} />
            <span>Get in Touch</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Contact Training & Placement Cell
          </h2>
          <p className={styles.sectionDesc}>
            Get in touch with our campus placement coordinators for drive inquiries, student support, and recruiter partnership assistance.
          </p>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={styles.contactCardIcon} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <MapPin size={22} />
            </div>
            <h3 className={styles.contactCardTitle}>Placement Office</h3>
            <p className={styles.contactCardValue}>Room 204, Administrative Block, Main Campus</p>
            <p className={styles.contactCardDesc}>
              Visit our desk during working hours for walk-in guidance and document verification.
            </p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactCardIcon} style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
              <Mail size={22} />
            </div>
            <h3 className={styles.contactCardTitle}>Email Support</h3>
            <p className={styles.contactCardValue}>tpo@college.edu</p>
            <p className={styles.contactCardDesc}>
              Send us an email anytime for student queries, verification requests, and company scheduling.
            </p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactCardIcon} style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
              <Phone size={22} />
            </div>
            <h3 className={styles.contactCardTitle}>Placement Helpline</h3>
            <p className={styles.contactCardValue}>+91 (080) 2456-7890</p>
            <p className={styles.contactCardDesc}>
              Call our helpline for immediate assistance with active recruitment drives and student login issues.
            </p>
          </div>
        </div>

        {/* Office Timings Banner */}
        <div className={styles.hoursBanner}>
          <div className={styles.hoursLeft}>
            <Clock size={20} className={styles.hoursIcon} />
            <div>
              <span className={styles.hoursTitle}>Office Working Hours</span>
              <p className={styles.hoursText}>
                Monday to Saturday: 9:00 AM – 5:00 PM (Closed on Sundays & Gazetted Holidays)
              </p>
            </div>
          </div>
          <Link href="/login" className={styles.hoursBtn}>
            <Send size={15} />
            Open Portal
          </Link>
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
          <a href="#features" className={styles.footerLink}>
            Features
          </a>
          <a href="#roles" className={styles.footerLink}>
            Solutions
          </a>
          <a href="#contact" className={styles.footerLink}>
            Contact
          </a>
          <Link href="/login" className={styles.footerLink}>
            Portal Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
